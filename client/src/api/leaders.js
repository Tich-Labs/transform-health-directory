import { supabase } from "../supabase";

export const api = {
  getLeaders: async (status = "live") => {
    let query = supabase.from("leaders").select("*");
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
      editor_email: formData.email || null,
      nominator_name: formData.nominatorName || null,
      country: formData.country || null,
      nominate_link: formData.nominateLink || null,
      expertise: formData.expertise
        ? formData.expertise.split(", ").filter(Boolean)
        : [],
      years_experience: formData.yearsExp || null,
      countries: formData.countries
        ? formData.countries.split(", ").filter(Boolean)
        : [],
      notable_items: formData.notableItems?.length ? formData.notableItems : null,
    };
    const { error } = await supabase.from("leaders").insert([payload]);
    if (error) throw error;
    return { ok: true };
  },

  submitRequest: async (data) => {
    const { error } = await supabase.from("requests").insert([{
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
    }]);
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
        supabase.from("leaders").update({ status: "rejected" }).eq("id", leaders[0].id)
      );
    }
    updates.push(
      supabase.from("requests").update({ status: "approved" }).eq("id", requestId)
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
    const { data: { publicUrl } } = supabase.storage
      .from("profile-photos")
      .getPublicUrl(data.path);
    return publicUrl;
  },

  trackLinkedInClick: async (leaderId) => {
    // First get current count
    const { data, error: fetchError } = await supabase
      .from("leaders")
      .select("linkedin_clicks")
      .eq("id", leaderId)
      .single();
    if (fetchError) throw fetchError;
    const current = data?.linkedin_clicks || 0;
    const { error } = await supabase
      .from("leaders")
      .update({ linkedin_clicks: current + 1 })
      .eq("id", leaderId);
    if (error) throw error;
    return { ok: true };
  },
};
