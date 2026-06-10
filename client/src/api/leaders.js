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
  requestManage: async ({ leaderId, firstName, lastName, linkedin, mode }) => {
    try {
      // Fetch leader's email from database
      const { data: leader, error: fetchErr } = await supabase
        .from("leaders")
        .select("leader_email, editor_email, first_name, last_name")
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
      const subject =
        mode === "delete"
          ? "Remove your Transform Health profile"
          : "Update your Transform Health profile";
      const html = `
        <div style="font-family: sans-serif; max-width:600px; margin:0 auto;">
          <h2>${subject}</h2>
          <p>Hi ${firstName},</p>
          <p>Click the link below to ${
            mode === "delete" ? "remove" : "update"
          } your profile in the Transform Health Women Leaders Directory:</p>
          <p><a href="${manageUrl}" style="display:inline-block; padding:12px 24px; background:#24588A; color:#fff; text-decoration:none; border-radius:6px;">${
            mode === "delete" ? "Remove my profile" : "Manage my profile"
          }</a></p>
          <p>Or copy this link: <code>${manageUrl}</code></p>
          <p><em>This link expires in 24 hours.</em></p>
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
