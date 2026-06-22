import { supabase } from "../supabase";

// Extract the Storage object path from a Supabase public URL.
// e.g. "https://…/storage/v1/object/public/profile-photos/1234-photo.jpg"
//   → "1234-photo.jpg"
function photoStoragePath(photoUrl) {
  if (!photoUrl) return null;
  const marker = "/profile-photos/";
  const idx = photoUrl.indexOf(marker);
  return idx !== -1 ? photoUrl.slice(idx + marker.length) : null;
}

// Best-effort Storage cleanup — logs a warning on failure but never throws.
async function removePhoto(photoUrl) {
  const path = photoStoragePath(photoUrl);
  if (!path) return;
  const { error } = await supabase.storage.from("profile-photos").remove([path]);
  if (error) console.warn("Photo cleanup failed (non-fatal):", error.message);
}

export const api = {
  getLeaders: async (status = "live") => {
    const isAdmin = status === "all";
    if (isAdmin) {
      // Admin fetch — full column list from the base table (authenticated)
      const { data, error } = await supabase
        .from("leaders")
        .select(
          `id, first_name, last_name, role, organisation, bio, linkedin, photo_url,
           status, branch, editor_email, leader_email, nominator_name, internal_note,
           country, geo_scope, nominate_link, expertise, years_experience, countries,
           notable_items, created_at, linkedin_clicks`
        );
      if (error) throw error;
      return data || [];
    }
    // Public fetch — query the view; anon role has no access to the base table
    // (migration 015_restrict_public_columns.sql revokes direct table access)
    const { data, error } = await supabase
      .from("public_leaders")
      .select("*");
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
      expertise: Array.isArray(formData.expertise)
        ? formData.expertise
        : formData.expertise ? formData.expertise.split(", ").filter(Boolean) : [],
      years_experience: formData.yearsExp || null,
      countries: Array.isArray(formData.countries)
        ? formData.countries
        : formData.countries ? formData.countries.split(", ").filter(Boolean) : [],
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

    const updates = [];
    if (req.leader_id) {
      updates.push(
        supabase
          .from("leaders")
          .update({ status: "rejected" })
          .eq("id", req.leader_id)
          .eq("status", "live")
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
    const { error } = await supabase.rpc("increment_linkedin_clicks", { leader_id: leaderId });
    if (error) console.warn("linkedin_clicks RPC failed:", error.message);
    return { ok: !error };
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
    // Uses a SECURITY DEFINER RPC so the anon role can match on the private
    // leader_email column without having direct SELECT on the leaders table.
    const { data } = await supabase.rpc("find_leader_by_email", {
      p_first_name: firstName.trim(),
      p_last_name:  lastName.trim(),
      p_email:      email.trim().toLowerCase(),
    });
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
    const { data: leader } = await supabase
      .from("leaders")
      .select("photo_url")
      .eq("id", id)
      .single();
    const { error } = await supabase.from("leaders").delete().eq("id", id);
    if (error) throw error;
    await removePhoto(leader?.photo_url);
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
  requestManage: async ({ leaderId, firstName, lastName, linkedin, photo_url, expertise, mode, missingFields }) => {
    try {
      // All sensitive work (email fetch, token generation, HTML build, send) happens
      // server-side in the Edge Function so leader_email never touches the client.
      const appUrl = `${window.location.origin}${window.location.pathname}`;
      const { error } = await supabase.functions.invoke("self-service", {
        body: {
          action: "request-manage",
          leaderId, mode, appUrl,
          firstName, lastName,
          linkedin, photoUrl: photo_url, expertise,
          missingFields: missingFields || [],
        },
      });
      if (error) throw error;
      return { ok: true };
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
      cc: true,
      missingFields: missing,
    });
  },

  // Fetch full leader data by ID (used when landing from magic link)
  getLeaderById: async (id) => {
    // Anon role has no SELECT on the base leaders table (migration 015).
    // public_leaders view exposes the same public-safe columns; it only
    // returns live rows so a non-null result implies status = 'live'.
    const { data, error } = await supabase
      .from("public_leaders")
      .select(
        "id, first_name, last_name, role, organisation, bio, linkedin, photo_url, expertise, country, geo_scope, years_experience, countries, notable_items"
      )
      .eq("id", id)
      .single();
    if (error) throw error;
    return data;
  },

  // Log a self-service action (update or delete) in the requests table for the activity log
  exportLeaders: async () => {
    const { data, error } = await supabase.from("leaders").select("*").order("created_at", { ascending: true });
    if (error) throw error;
    return data;
  },

  exportRequests: async () => {
    const { data, error } = await supabase.from("requests").select("*").order("created_at", { ascending: true });
    if (error) throw error;
    return data;
  },

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

  // Self-service: leader deletes their own profile (marks as rejected + clears photo)
  deleteByLeader: async (id, reason) => {
    const { data: leader } = await supabase
      .from("leaders")
      .select("photo_url")
      .eq("id", id)
      .single();
    const { error } = await supabase
      .from("leaders")
      .update({ status: "rejected", photo_url: null, internal_note: reason || null })
      .eq("id", id);
    if (error) throw error;
    await removePhoto(leader?.photo_url);
    return { ok: true };
  },

  // Notify admin about a self-service action
  notifyAdmin: async ({ subject, html }) => {
    // 'notify-admin' action — EF resolves recipient from ADMIN_NOTIFY_EMAIL secret (never in client)
    const { error } = await supabase.functions.invoke("self-service", {
      body: { action: "notify-admin", subject, html },
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
