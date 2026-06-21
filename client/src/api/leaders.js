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
      .eq("leader_email", email.trim().toLowerCase())
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
  // Also used by admin enrichment flow via sendEnrichmentLink below
  requestManage: async ({ leaderId, firstName, lastName, linkedin, photo_url, expertise, mode, cc, contactEmail, missingFields }) => {
    try {
      // Fetch leader's email from database
      const { data: leader, error: fetchErr } = await supabase
        .from("leaders")
        .select("leader_email, first_name, last_name, photo_url, expertise, linkedin")
        .eq("id", leaderId)
        .single();

      const email = leader?.leader_email;
      if (fetchErr || !email) {
        throw new Error("Leader email not found");
      }

      const { data: tokenData, error: tokenErr } = await supabase.functions.invoke(
        "generate-manage-token",
        { body: { leaderId, mode } },
      );
      if (tokenErr || !tokenData?.token) throw new Error("Failed to generate secure token");
      const manageUrl = `${window.location.origin}${window.location.pathname}?manage=${tokenData.token}`;
      const isDelete = mode === "delete";
      const isEnrichment = missingFields && missingFields.length > 0;
      const subject = isEnrichment
        ? "Update your Transform Health profile — some sections need your attention"
        : isDelete
          ? "Remove your Transform Health profile"
          : "Update your Transform Health profile";

      // Resolve avatar, linkedin, and tags from passed values, falling back to database
      const avatarUrl = photo_url || leader?.photo_url;
      const linkedinUrl = linkedin || leader?.linkedin || "";
      const rawTags = expertise || leader?.expertise || [];
      const tags = (
        Array.isArray(rawTags) ? rawTags : (rawTags || "").split(/,\s*/)
      ).filter(Boolean);

      const initials = ((firstName?.[0] || "") + (lastName?.[0] || "")).toUpperCase();

      const FIELD_DESCRIPTIONS = {
        "Country": "Where you are based",
        "Years of experience": "How long you have been working in this space",
        "Biography": "A short paragraph about your background and impact",
        "Geographical scope": "The region where most of your work takes place",
        "Profile photo": "A headshot or professional photo",
        "Expertise tags": "Your areas of specialisation (e.g. Digital Health, AI & Automation)",
        "Countries of work": "Countries where you actively work or have worked",
        "Notable items": "Publications, projects, awards, or initiatives you want to highlight (up to 3)",
      };

      const missingFieldsHtml = isEnrichment
        ? `
            <!-- Enrichment preamble -->
            <div style="background:#fef9e7;border:1px solid #fde68a;border-radius:8px;padding:16px;margin-bottom:16px;text-align:left;max-width:480px;margin-left:auto;margin-right:auto">
              <div style="font-size:1.3rem;font-weight:600;color:#92400e;margin-bottom:8px;text-align:center">
                Your profile needs a little love 💕
              </div>
              <div style="font-size:1.2rem;color:#78350f;line-height:1.6;text-align:center;margin-bottom:12px">
                You're in the directory, but these sections are still empty:
              </div>
              ${missingFields.map(f => `
                <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:6px;padding:10px 14px;margin-bottom:8px">
                  <div style="font-size:1.2rem;font-weight:600;color:#92400e">${f}</div>
                  <div style="font-size:1.1rem;color:#78350f;margin-top:2px">${FIELD_DESCRIPTIONS[f] || ""}</div>
                </div>`).join("")}
              <div style="font-size:1.2rem;color:#78350f;margin-top:12px;text-align:center">
                Click the button below to fill these in — it only takes a few minutes.
              </div>
            </div>`
        : "";

      const contactHtml = contactEmail
        ? `<div style="font-size:1rem;color:#6b7280;line-height:1.5;text-align:center;padding:0 16px;margin-top:8px">
              Questions? Contact <a href="mailto:${contactEmail}" style="color:#F85A8E;font-weight:500;text-decoration:underline">${contactEmail}</a>
            </div>`
        : "";

      const html = `
        <table cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="#f5efe0" style="background-color:#f5efe0;font-family:'Montserrat',Arial,Helvetica,sans-serif">
          <tr><td align="center" style="padding:24px 16px 0">
            <!-- Transform Health logo — centered -->
            <img src="https://transformhealthcoalition.org/wp-content/themes/th/assets/images/main_logo.svg" alt="Transform Health" style="display:block;border:0;outline:none;text-decoration:none;height:32px;width:auto;margin:0 auto" />
          </td></tr>
          <tr><td style="padding:16px 0">
            <!-- 4px full-width horizontal line -->
            <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td height="1" bgcolor="#F85A8E" style="height:1px;background:#F85A8E;font-size:0;line-height:0">&nbsp;</td></tr></table>
          </td></tr>
          <tr><td align="center" style="padding:0 16px">
            ${missingFieldsHtml}

            <!-- Avatar — photo or initials with brand-pink ring + linkedin badge -->
            <table cellpadding="0" cellspacing="0" border="0">
              <tr><td style="position:relative;text-align:center">
                ${
                  avatarUrl
                    ? `<img src="${avatarUrl}" alt="${firstName} ${lastName}" style="display:block;width:76px;height:76px;border-radius:50%;border:2px solid #F85A8E;outline:none" />`
                    : `<table cellpadding="0" cellspacing="0" border="0" style="width:76px;height:76px;border-radius:50%;background:#D9D9D9;border:2px solid #F85A8E"><tr><td align="center" valign="middle" style="font-size:2rem;font-weight:600;color:#666;line-height:76px">${initials}</td></tr></table>`
                }
                ${
                  linkedinUrl
                    ? `<a href="${linkedinUrl}" target="_blank" style="position:absolute;bottom:0;right:0;width:22px;height:22px;display:block;text-decoration:none">
                        <svg viewBox="0 0 24 24" fill="none" style="width:22px;height:22px;display:block">
                          <rect width="24" height="24" rx="3" fill="#0A66C2"/>
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452z" fill="white"/>
                        </svg>
                      </a>`
                    : ""
                }
              </td></tr>
            </table>

            <!-- Name -->
            <div style="font-size:1.6rem;font-weight:600;color:#111827;margin:16px 0 12px;line-height:1.3;text-align:center">
              ${firstName} ${lastName}
            </div>

            <!-- Tags — expertise pills matching card style -->
            ${
              tags.length
                ? `<div style="text-align:center;margin-bottom:16px">${tags
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
            <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 16px">
              <tr>
                <td align="center" style="border-radius:20px;${
                  isDelete ? "background:#EF4444" : "background:#F85A8E"
                }">
                  <a href="${manageUrl}" style="display:inline-block;min-width:200px;padding:10px 24px;border-radius:20px;color:#fff;text-decoration:none;font-size:1.3rem;font-weight:500;text-align:center">
                    ${isDelete ? "Remove my profile" : "Manage my profile"}
                  </a>
                </td>
              </tr>
            </table>

            <!-- Expiry badge — amber warning pill -->
            <div style="text-align:center;margin-bottom:16px">
              <span style="display:inline-block;background:#fde68a;color:#92400e;font-size:1.1rem;font-weight:500;padding:4px 14px;border-radius:9999px">
                ⏰ Expires in 48 hours
              </span>
            </div>

            <!-- Fallback link — monospace code block -->
            <div style="font-size:1.2rem;color:#6b7280;margin-bottom:8px;text-align:center">Or copy this link:</div>
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f3f4f6;border:1px solid #e5e7eb;border-radius:6px;max-width:448px;margin:0 auto">
              <tr><td style="padding:10px 14px;font-family:'Courier New','Consolas',monospace;font-size:1.1rem;color:#374151;word-break:break-all">${manageUrl}</td></tr>
            </table>

            <!-- Divider -->
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:24px 0 16px"><tr><td height="1" bgcolor="#d1d5db" style="height:1px;background:#d1d5db;font-size:0;line-height:0">&nbsp;</td></tr></table>

            <!-- Footer -->
            <div style="font-size:1rem;color:#9ca3af;line-height:1.5;text-align:center;padding:0 16px">
              You received this because you have a profile in the<br />
              <span style="color:#F85A8E;font-weight:600">Transform Health Women Leaders Directory</span>.<br />
              Didn&#39;t request this? You can safely ignore this email.
            </div>
            ${contactHtml}
          </td></tr>
        </table>
      `;

      const body = { to: email, subject, html };
      if (cc) body.cc = cc;

      const { error } = await supabase.functions.invoke("send-email", { body });

      if (error) throw error;
      return { ok: true, message: "Magic link sent to " + email };
    } catch (err) {
      console.error("requestManage failed:", err);
      return {
        ok: false,
        message: "We couldn't send your link right now. Please contact the admin team for help.",
      };
    }
  },

  // Admin-triggered enrichment: save leader email and send magic link highlighting missing fields
  sendEnrichmentLink: async ({ leaderId, email }) => {
    const CONTACT = import.meta.env.VITE_ADMIN_CC_EMAIL;

    // Save the admin-provided email to the leader's record
    const { error: saveErr } = await supabase
      .from("leaders")
      .update({ leader_email: email })
      .eq("id", leaderId);
    if (saveErr) throw saveErr;

    // Fetch refreshed leader data
    const { data: leader, error: fetchErr } = await supabase
      .from("leaders")
      .select("first_name, last_name, linkedin, photo_url, expertise, country, years_experience, bio, geo_scope, countries, notable_items")
      .eq("id", leaderId)
      .single();
    if (fetchErr) throw fetchErr;

    // Compute missing fields
    const missing = [];
    if (!leader.country) missing.push("Country");
    if (!leader.years_experience) missing.push("Years of experience");
    if (!leader.bio) missing.push("Biography");
    if (!leader.geo_scope) missing.push("Geographical scope");
    if (!leader.photo_url) missing.push("Profile photo");
    if (!leader.expertise || leader.expertise.length === 0) missing.push("Expertise tags");
    if (!leader.countries || leader.countries.length === 0) missing.push("Countries of work");
    if (!leader.notable_items || leader.notable_items.length === 0) missing.push("Notable items");

    const fieldLabels = {
      country: "Country",
      years_experience: "Years of experience",
      bio: "Biography",
      geo_scope: "Geographical scope",
      photo_url: "Profile photo",
      countries: "Countries of work",
      notable_items: "Notable items",
    };

    return await api.requestManage({
      leaderId,
      firstName: leader.first_name,
      lastName: leader.last_name,
      linkedin: leader.linkedin,
      photo_url: leader.photo_url,
      expertise: leader.expertise,
      mode: "update",
      cc: CONTACT,
      contactEmail: CONTACT,
      missingFields: missing,
    });
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
        to: import.meta.env.VITE_ADMIN_NOTIFY_EMAIL,
        subject,
        html,
      },
    });
    if (error) console.error("Admin notification failed:", error);
  },

  // Get the current user's admin role from admin_roles table
  getAdminRole: async (email) => {
    if (!email) return null;
    const { data, error } = await supabase
      .from("admin_roles")
      .select("role")
      .eq("email", email)
      .maybeSingle();
    if (error) {
      console.error("getAdminRole error:", error);
      return null;
    }
    return data?.role || null;
  },

  // Super admin: manage other admin users (invoke edge function)
  manageAdmin: async ({ action, email, role, invokerEmail }) => {
    const { data, error } = await supabase.functions.invoke("manage-admin", {
      body: { action, email, role, invokerEmail, origin: window.location.origin },
    });
    if (error) {
      // Try to extract the real error message from the function response body
      if (error.context instanceof Response) {
        try {
          const body = await error.context.json();
          if (body?.error) throw new Error(body.error);
        } catch (parseErr) {
          if (parseErr !== error) throw parseErr;
        }
      }
      throw error;
    }
    return data;
  },
};
