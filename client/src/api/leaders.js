import { supabase } from "../supabase";

export const api = {
  getLeaders: async (status = "live") => {
    const isAdmin = status === "all";
    const cols = isAdmin
      ? `id, first_name, last_name, role, organisation, bio, linkedin, photo_url,
         status, branch, editor_email, leader_email, nominator_name, internal_note,
         country, geo_scope, nominate_link, expertise, years_experience, countries,
         notable_items, admin_token, created_at`
      : `id, first_name, last_name, role, organisation, bio, linkedin, photo_url,
         status, editor_email, internal_note, country, nominate_link, expertise,
         years_experience, countries, notable_items, created_at`;
    let query = supabase.from("leaders").select(cols);
    if (status && status !== "all") query = query.eq("status", status);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  submitProfile: async (formData) => {
    const payload = {
      id: crypto.randomUUID(),
      branch: formData.branch || "self",
      first_name: formData.firstName,
      last_name: formData.lastName,
      role: formData.role || null,
      organisation: formData.organisation || null,
      bio: formData.bio || null,
      linkedin: formData.linkedin || null,
      photo_url: formData.photoUrl || null,
      status: "pending",
      editor_email: formData.editorEmail || null, // Person who submitted (could be different from leader)
      leader_email: formData.email || null, // Leader's own email (NOT visible in public)
      nominator_name:
        formData.branch === "nominate" ? formData.nominatorName || null : null,
      country: formData.country || null,
      geo_scope: formData.geo_scope || null,
      nominate_link: formData.nominateLink || null,
      expertise: formData.expertise
        ? formData.expertise.split(", ").filter(Boolean)
        : [],
      years_experience: formData.yearsExp || null,
      countries: formData.countries
        ? formData.countries.split(", ").filter(Boolean)
        : [],
      notable_items: formData.notableItems?.length
        ? formData.notableItems
        : null,
    };
    const { error } = await supabase.from("leaders").insert([payload]);
    if (error) throw error;
    return { ok: true };
  },

  submitRequest: async (data) => {
    const payload = {
      id: crypto.randomUUID(),
      request_type: data.requestType,
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email || null,
      linkedin: data.linkedin || null,
      changes: data.changes || null,
      reason: data.reason || null,
      status: "pending",
      leader_id: data.leaderId || null,
    };
    const { error, data: result } = await supabase
      .from("requests")
      .insert([payload]);
    if (error) {
      console.error("Request submission error:", error);
      throw error;
    }
    // Verify by fetching recent requests
    const { data: recent, error: verifyErr } = await supabase
      .from("requests")
      .select("*")
      .eq("email", payload.email)
      .order("created_at", { ascending: false })
      .limit(1);

    if (verifyErr) {
      console.warn("Could not verify saved request:", verifyErr);
    }

    return { ok: true };
  },

  dismissRequest: async (id) => {
    const { error } = await supabase
      .from("requests")
      .update({ status: "dismissed" })
      .eq("id", id);
    if (error) throw error;
    return { ok: true };
  },

  getRequests: async () => {
    const { data, error } = await supabase
      .from("requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  },

  approveRequest: async (id) => {
    const { error } = await supabase
      .from("leaders")
      .update({ status: "live" })
      .eq("id", id);
    if (error) throw error;
    return { ok: true };
  },

  rejectRequest: async (id) => {
    const { error } = await supabase
      .from("leaders")
      .update({ status: "rejected" })
      .eq("id", id);
    if (error) throw error;
    return { ok: true };
  },

  approveDeleteRequest: async (requestId) => {
    const { data: req, error: reqErr } = await supabase
      .from("requests")
      .select("*")
      .eq("id", requestId)
      .single();
    if (reqErr) throw reqErr;

    const { data: leaders } = await supabase
      .from("leaders")
      .select("id")
      .ilike("first_name", req.first_name)
      .ilike("last_name", req.last_name)
      .eq("status", "live")
      .limit(1);

    const updates = [];
    if (leaders?.length) {
      updates.push(
        supabase
          .from("leaders")
          .update({ status: "rejected" })
          .eq("id", leaders[0].id)
      );
    }
    updates.push(
      supabase
        .from("requests")
        .update({ status: "approved" })
        .eq("id", requestId)
    );
    await Promise.all(updates);
    return { ok: true };
  },

  uploadPhoto: async (file) => {
    const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
    const { data, error } = await supabase.storage
      .from("profile-photos")
      .upload(fileName, file, { upsert: false });
    if (error) throw error;
    const {
      data: { publicUrl },
    } = supabase.storage.from("profile-photos").getPublicUrl(data.path);
    return publicUrl;
  },

  trackLinkedInClick: async (leaderId) => {
    // First try to increment via RPC (if set up)
    const { error: rpcError } = await supabase.rpc(
      "increment_linkedin_clicks",
      { leader_id: leaderId }
    );
    if (!rpcError) return { ok: true };

    // Fallback: get current count and update
    const { data, error: fetchError } = await supabase
      .from("leaders")
      .select("linkedin_clicks")
      .eq("id", leaderId)
      .single();

    if (fetchError) {
      console.warn(
        "linkedin_clicks column may not exist yet:",
        fetchError.message
      );
      return { ok: false, error: "column_not_found" };
    }

    const current = data?.linkedin_clicks || 0;
    const { error: updateError } = await supabase
      .from("leaders")
      .update({ linkedin_clicks: current + 1 })
      .eq("id", leaderId);

    if (updateError) {
      console.warn("Failed to update linkedin_clicks:", updateError.message);
      return { ok: false, error: updateError.message };
    }

    return { ok: true };
  },

  checkDuplicateName: async (firstName, lastName) => {
    const { data } = await supabase
      .from("leaders")
      .select("id, first_name, last_name, status")
      .ilike("first_name", firstName.trim())
      .ilike("last_name", lastName.trim())
      .in("status", ["live", "pending"]);
    return data || [];
  },

  findLeader: async ({ firstName, lastName, email }) => {
    if (!email) return null;

    const { data } = await supabase
      .from("leaders")
      .select(
        "id, first_name, last_name, role, organisation, linkedin, photo_url, bio, expertise, notable_items, country"
      )
      .eq("status", "live")
      .ilike("first_name", firstName.trim())
      .ilike("last_name", lastName.trim())
      .or(`leader_email.eq.${email.trim().toLowerCase()},editor_email.eq.${email.trim().toLowerCase()}`)
      .limit(1);

    return data?.length > 0 ? data[0] : null;
  },

  getTestResults: async () => {
    const { data, error } = await supabase
      .from("test_results")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data || [];
  },

  deleteLeader: async (id) => {
    const { error } = await supabase.from("leaders").delete().eq("id", id);
    if (error) throw error;
    return { ok: true };
  },

  deleteTestResult: async (id) => {
    const { error } = await supabase.from("test_results").delete().eq("id", id);
    if (error) throw error;
    return { ok: true };
  },

  deleteTestResultsForTester: async (testerName) => {
    const { error } = await supabase
      .from("test_results")
      .delete()
      .eq("tester_name", testerName);
    if (error) throw error;
    return { ok: true };
  },

  // Send a magic link email via Supabase Function (send-email)
  // Used for self-service: leader requests a magic link directly (no admin needed)
  requestManage: async ({ leaderId, firstName, lastName, linkedin, photo_url, expertise, mode }) => {
    try {
      // Fetch leader's email from database
      const { data: leader, error: fetchErr } = await supabase
        .from("leaders")
        .select("leader_email, editor_email, first_name, last_name, photo_url, expertise")
        .eq("id", leaderId)
        .single();

      const email = leader?.leader_email || leader?.editor_email;
      if (fetchErr || !email) {
        throw new Error("Leader email not found");
      }

      const token = btoa(
        JSON.stringify({ leaderId, mode })
      );
      const manageUrl = `${window.location.origin}${window.location.pathname}?manage=${token}`;
      const isDelete = mode === "delete";
      const subject = isDelete
        ? "Remove your Transform Health profile"
        : "Update your Transform Health profile";

      // Resolve avatar and tags from passed values, falling back to database
      const avatarUrl = photo_url || leader?.photo_url;
      const rawTags = expertise || leader?.expertise || [];
      const tags = (
        Array.isArray(rawTags) ? rawTags : (rawTags || "").split(/,\s*/)
      ).filter(Boolean);

      const initials = ((firstName?.[0] || "") + (lastName?.[0] || "")).toUpperCase();

      const html = `
        <div style="font-family:'Montserrat',Arial,Helvetica,sans-serif;max-width:448px;margin:0 auto;background:#fffff4;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;box-shadow:0 1px 3px rgba(0,0,0,0.08)">
          <!-- Dark navy banner with concentric ring clusters and scattered dots -->
          <div style="background:#333333;height:120px;position:relative;overflow:hidden">
            <div style="position:absolute;top:-28px;left:30px;width:88px;height:88px;border:2px solid rgba(255,255,255,0.12);border-radius:50%"></div>
            <div style="position:absolute;top:76px;left:57px;width:88px;height:88px;border:2px solid rgba(255,255,255,0.12);border-radius:50%"></div>
            <div style="position:absolute;top:-19px;left:290px;width:88px;height:88px;border:2px solid rgba(255,255,255,0.12);border-radius:50%"></div>
            <div style="position:absolute;top:53px;left:378px;width:88px;height:88px;border:2px solid rgba(255,255,255,0.12);border-radius:50%"></div>
            <div style="position:absolute;top:0;left:193px;width:88px;height:88px;border:2px solid rgba(255,255,255,0.12);border-radius:50%"></div>
            <div style="position:absolute;top:20px;left:150px;width:4px;height:4px;background:rgba(255,255,255,0.25);border-radius:50%"></div>
            <div style="position:absolute;top:70px;left:200px;width:3px;height:3px;background:rgba(255,255,255,0.15);border-radius:50%"></div>
            <div style="position:absolute;top:30px;left:350px;width:5px;height:5px;background:rgba(255,255,255,0.2);border-radius:50%"></div>
            <div style="position:absolute;top:90px;left:100px;width:3px;height:3px;background:rgba(255,255,255,0.15);border-radius:50%"></div>
            <div style="position:absolute;top:45px;left:260px;width:4px;height:4px;background:rgba(255,255,255,0.2);border-radius:50%"></div>
            <div style="position:absolute;top:15px;left:310px;width:3px;height:3px;background:rgba(255,255,255,0.15);border-radius:50%"></div>
            <div style="position:absolute;top:65px;left:30px;width:4px;height:4px;background:rgba(255,255,255,0.2);border-radius:50%"></div>
          </div>

          <!-- Avatar — photo or initials with brand-pink ring -->
          <div style="text-align:center;margin-top:-38px">
            ${
              avatarUrl
                ? `<img src="${avatarUrl}" alt="${firstName} ${lastName}" style="width:76px;height:76px;border-radius:50%;object-fit:cover;border:2px solid #F85A8E;display:inline-block" />`
                : `<div style="width:76px;height:76px;border-radius:50%;background:#D9D9D9;border:2px solid #F85A8E;display:inline-flex;align-items:center;justify-content:center;font-size:2rem;font-weight:600;color:#666;line-height:1">${initials}</div>`
            }
          </div>

          <!-- Body -->
          <div style="padding:16px 20px 24px;text-align:center">
            <!-- Name -->
            <div style="font-size:1.6rem;font-weight:600;color:#111827;margin-bottom:12px;line-height:1.3">
              ${firstName} ${lastName}
            </div>

            <!-- Tags — expertise pills matching card style -->
            ${
              tags.length
                ? `<div style="margin-bottom:16px">${tags
                    .map(
                      (t) =>
                        `<span style="display:inline-block;font-size:1.2rem;font-weight:500;background:#e6f0ff;color:#02598E;padding:2px 10px;border-radius:9999px;border:1px solid #d1d9ec;margin:2px">${t
                          .replace(/^Other:\s*/i, "")
                          .replace(/\b\w/g, (c) => c.toUpperCase())}</span>`
                    )
                    .join("")}</div>`
                : ""
            }

            <!-- CTA button — pink for update, red for delete -->
            <a href="${manageUrl}" style="display:inline-flex;align-items:center;justify-content:center;min-width:200px;height:40px;${
              isDelete ? "background:#EF4444" : "background:#F85A8E"
            };border-radius:20px;color:#fff;text-decoration:none;font-size:1.3rem;font-weight:500;padding:0 24px;margin-bottom:16px">
              ${isDelete ? "Remove my profile" : "Manage my profile"}
            </a>

            <!-- Expiry badge — amber warning pill -->
            <div style="margin-bottom:16px">
              <span style="display:inline-block;background:#fde68a;color:#92400e;font-size:1.1rem;font-weight:500;padding:4px 14px;border-radius:9999px">
                ⏰ Expires in 24 hours
              </span>
            </div>

            <!-- Fallback link — monospace code block -->
            <div style="font-size:1.2rem;color:#6b7280;margin-bottom:8px">Or copy this link:</div>
            <div style="background:#f3f4f6;border:1px solid #e5e7eb;border-radius:6px;padding:10px 14px;font-family:'Courier New','Consolas',monospace;font-size:1.1rem;color:#374151;word-break:break-all;text-align:left">${manageUrl}</div>
          </div>
        </div>
      `;

      const { error } = await supabase.functions.invoke("send-email", {
        body: {
          to: email,
          subject,
          html,
        },
      });

      if (error) throw error;
      return { ok: true, message: "Magic link sent to " + email };
    } catch (err) {
      console.error("requestManage failed:", err);
      const token = btoa(
        JSON.stringify({ leaderId, mode })
      );
      const url = `${window.location.origin}?manage=${token}`;
      return {
        ok: false,
        url,
        message: "Email service unavailable. Use this link instead:",
      };
    }
  },

  // Fetch full leader data by ID (used when landing from magic link)
  getLeaderById: async (id) => {
    const { data, error } = await supabase
      .from("leaders")
      .select(
        "id, first_name, last_name, role, organisation, bio, linkedin, photo_url, expertise, country, geo_scope, years_experience, countries, notable_items, status"
      )
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  // Log a self-service action (update or delete) in the requests table for the activity log
  logSelfService: async ({ leaderId, firstName, lastName, action, details }) => {
    const { error } = await supabase.from("requests").insert([{
      id: crypto.randomUUID(),
      request_type: action === "delete" ? "delete" : "update",
      status: "approved",
      leader_id: leaderId,
      first_name: firstName,
      last_name: lastName,
      changes: details || null,
      created_at: new Date().toISOString(),
    }]);
    if (error) console.error("Failed to log self-service action:", error);
  },

  // Self-service: leader updates their own profile directly
  updateLeader: async (id, data) => {
    const { error } = await supabase.from("leaders").update(data).eq("id", id);
    if (error) throw error;
    return { ok: true };
  },

  // Self-service: leader deletes their own profile (marks as rejected)
  deleteByLeader: async (id, reason) => {
    const { error } = await supabase
      .from("leaders")
      .update({ status: "rejected", internal_note: reason || null })
      .eq("id", id);
    if (error) throw error;
    return { ok: true };
  },

  // Notify admin about a self-service action
  notifyAdmin: async ({ subject, html }) => {
    // Send to the configured noreply address which can forward to admin team
    const { error } = await supabase.functions.invoke("send-email", {
      body: {
        to: "noreply@transformhealthcoalition.org",
        subject,
        html,
      },
    });
    if (error) console.error("Admin notification failed:", error);
  },
};
