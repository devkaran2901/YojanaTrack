/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { saveSession, getUser, clearSession, getToken } from "./auth";
import {
  Wheat, Landmark, Briefcase, GraduationCap, HeartPulse, Home, Scale, Microscope, 
  BarChart, Users, Medal, Bus, Plane, Droplets, Baby,
  ClipboardList, Search, MousePointerClick, Coins, Bookmark, Zap, FileText, CheckCircle
} from "lucide-react";
const SCHEMES = []; // Replaced by dbSchemes

const NOTIFICATIONS = [
  { id:1, title:"New scheme matched!", message:"PM Mudra Yojana now matches your profile.", time:"2h ago", read:false, schemeId:9 },
  { id:2, title:"Deadline alert", message:"OBC Pre-Matric Scholarship closes in 15 days.", time:"1d ago", read:false, schemeId:8 },
  { id:3, title:"Profile updated", message:"Your profile changes matched 2 new schemes.", time:"3d ago", read:true },
];

const CATEGORIES = ["All","Agriculture","Education","Health","Housing","Business","Welfare"];
const STATES = ["Punjab","UP","Bihar","Rajasthan","Maharashtra","Karnataka","Gujarat","MP","Tamil Nadu","West Bengal"];

function isEligible(user, scheme) {
  const c = scheme.criteria || scheme.eligibilityCriteria;
  if (!c) return true;
  if (c.minAge && user.age < c.minAge) return false;
  if (c.maxAge && user.age > c.maxAge) return false;
  if (c.maxIncome && user.income > c.maxIncome) return false;
  if (c.gender && c.gender !== "any" && c.gender !== user.gender) return false;
  if (c.states?.length && !c.states.includes(user.state)) return false;
  if (c.casteCategory && c.casteCategory.length > 0) {
    const allowed = Array.isArray(c.casteCategory) ? c.casteCategory : [c.casteCategory];
    if (!allowed.includes(user.casteCategory)) return false;
  }
  if (c.occupation && c.occupation.length > 0) {
    const allowed = Array.isArray(c.occupation) ? c.occupation : [c.occupation];
    if (!allowed.includes(user.occupation)) return false;
  }
  return true;
}

function getScore(user, scheme) {
  const c = scheme.criteria || scheme.eligibilityCriteria;
  if (!c) return 1;
  let total = 0, passed = 0;
  if (c.minAge !== undefined && c.minAge !== null) { total++; if (user.age >= c.minAge) passed++; }
  if (c.maxAge !== undefined && c.maxAge !== null) { total++; if (user.age <= c.maxAge) passed++; }
  if (c.maxIncome !== undefined && c.maxIncome !== null) { total++; if (user.income <= c.maxIncome) passed++; }
  if (c.gender && c.gender !== "any") { total++; if (c.gender === user.gender) passed++; }
  if (c.states && c.states.length > 0) { total++; if (c.states.includes(user.state)) passed++; }
  if (c.casteCategory && c.casteCategory.length > 0) {
    total++;
    const a = Array.isArray(c.casteCategory) ? c.casteCategory : [c.casteCategory];
    if (a.includes(user.casteCategory)) passed++;
  }
  if (c.occupation && c.occupation.length > 0) {
    total++;
    const a = Array.isArray(c.occupation) ? c.occupation : [c.occupation];
    if (a.includes(user.occupation)) passed++;
  }
  return total ? passed/total : 1;
}

const categoryColors = {
  Agriculture:"#2d6a4f", Education:"#1d3557", Health:"#c1121f",
  Housing:"#7b2d8b", Business:"#e76f51", Welfare:"#457b9d", All:"#333"
};
const categoryBg = {
  Agriculture:"#d8f3dc", Education:"#dbe4ff", Health:"#ffe5e5",
  Housing:"#f0d6f5", Business:"#fde8df", Welfare:"#d6eaf8"
};

const getCategoryIcon = (category, size=24, color="currentColor") => {
  switch(category) {
    case "Agriculture": return <Wheat size={size} color={color} />;
    case "Education": return <GraduationCap size={size} color={color} />;
    case "Health": return <HeartPulse size={size} color={color} />;
    case "Housing": return <Home size={size} color={color} />;
    case "Business": return <Briefcase size={size} color={color} />;
    case "Welfare": return <Users size={size} color={color} />;
    default: return <FileText size={size} color={color} />;
  }
};

export default function App({ page: initialPage = "home" }) {
  const [page, setPage] = useState(initialPage);

  useEffect(() => {
    setPage(initialPage);
  }, [initialPage]);
  const location = useLocation();
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const [profile, setProfile] = useState({ name:"", age:"", gender:"", income:"", state:"", occupation:"", casteCategory:"", phone:"", email:"" });
  const [profileSaved, setProfileSaved] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [filterState, setFilterState] = useState("All");
  const [filterMinistry, setFilterMinistry] = useState("All");
  const [wizardStep, setWizardStep] = useState(1);
  const [showEligibleOnly, setShowEligibleOnly] = useState(false);
  const [dashboardLimit, setDashboardLimit] = useState(5);
  const [settingsTab, setSettingsTab] = useState("profile");
  const [detailTab, setDetailTab] = useState("details");
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [bookmarks, setBookmarks] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [toast, setToast] = useState(null);
  const [adminSecret, setAdminSecret] = useState("");
  const [adminSchemes, setAdminSchemes] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [editingScheme, setEditingScheme] = useState(null);
  const notifRef = useRef(null);
  const currentUser = getUser();
  const [dbSchemes, setDbSchemes] = useState([]);
  const [heroSlide, setHeroSlide] = useState(0);

  useEffect(() => {
    if (page === "home" && dbSchemes.length > 0) {
      const maxSlides = Math.min(dbSchemes.length, 4);
      const timer = setInterval(() => {
        setHeroSlide(s => (s + 1) % maxSlides);
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [page, dbSchemes.length]);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/schemes?limit=1000`)
      .then(res => setDbSchemes(res.data.schemes || []))
      .catch(console.error);
  }, []);

  const unread = notifications.filter(n=>!n.read).length;

  useEffect(() => {
    const fetchProfile = async () => {
      const token = getToken();
      if (!token) return;
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const u = res.data;
        if (u) {
          setProfile(prev => ({
            ...prev,
            name: u.name || prev.name,
            age: (u.age !== undefined && u.age !== null) ? u.age : "",
            gender: u.gender || "male",
            income: (u.income !== undefined && u.income !== null) ? u.income : "",
            state: u.state || "Punjab",
            occupation: u.occupation || "farmer",
            casteCategory: u.casteCategory || "general",
            email: u.email || prev.email
          }));
          if (u.age !== undefined && u.age !== null && u.age !== "" && u.income !== undefined && u.income !== null && u.income !== "") {
            setProfileSaved(true);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    if (currentUser) fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, navigate]);

  useEffect(() => {
    if (page === "scheme-details" && routeId) {
      const scheme = dbSchemes.find(s => s.id === parseInt(routeId) || s._id === routeId || s.id === routeId);
      if (scheme) setSelectedScheme(scheme);
    }
  }, [page, routeId, dbSchemes]);

  const showToast = (msg, type="success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const user = { ...profile, age: parseInt(profile.age)||0, income: parseInt(profile.income)||0 };
  const matched = dbSchemes.filter(s => isEligible(user, s));
  const nearMiss = dbSchemes.filter(s => !isEligible(user, s) && getScore(user, s) >= 0.6).sort((a,b) => getScore(user,b) - getScore(user,a));

  const filtered = dbSchemes.filter(s => {
    const matchCat = category === "All" || s.category === category;
    const matchState = filterState === "All" || s.state === filterState || s.criteria?.states?.includes(filterState);
    const matchMin = filterMinistry === "All" || s.ministry.includes(filterMinistry);
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase());
    const matchElig = !showEligibleOnly || !profileSaved || isEligible(user, s);
    return matchCat && matchState && matchMin && matchSearch && matchElig;
  }).sort((a, b) => {
    if (profileSaved) {
      const eligA = isEligible(user, a) ? 1 : 0;
      const eligB = isEligible(user, b) ? 1 : 0;
      return eligB - eligA;
    }
    return 0;
  });

  const toggleBookmark = (id) => {
    setBookmarks(prev => prev.includes(id) ? prev.filter(b=>b!==id) : [...prev, id]);
    showToast(bookmarks.includes(id) ? "Removed from saved" : "Scheme saved!");
  };

  const applyScheme = (scheme) => {
    if (applications.find(a=>a.id===scheme.id)) return;
    setApplications(prev => [...prev, { ...scheme, status:"Applied", appliedOn: new Date().toLocaleDateString("en-IN") }]);
    showToast("Applied to " + scheme.name + "!");
    setSelectedScheme(null);
  };

  const markAllRead = () => setNotifications(prev => prev.map(n=>({...n, read:true})));

  const navItems = [
    { id:"home", label:"Home" },
    ...(currentUser ? [
      { id:"dashboard", label:"Dashboard" },
      { id:"schemes", label:"Browse Schemes" },
      { id:"settings", label:"Settings" },
    ] : []),
    // Admin tab is only shown for logged-in admin users
    ...(currentUser?.role === "admin" ? [{ id:"admin", label:"Admin" }] : []),
  ];

  const ADMIN_API = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const fetchAdminSchemes = async () => {
    try {
      setAdminLoading(true);
      const res = await axios.get(`${ADMIN_API}/api/admin/schemes`, {
        headers: { "x-admin-secret": adminSecret },
      });
      setAdminSchemes(res.data.schemes || []);
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to load schemes", "error");
    } finally {
      setAdminLoading(false);
    }
  };

  const saveAdminScheme = async (e) => {
    e.preventDefault();
    const form = e.target;
    const payload = {
      name: form.name.value,
      description: form.description.value,
      category: form.category.value,
      isActive: form.isActive.checked,
      eligibilityCriteria: {
        minAge: form.minAge.value ? Number(form.minAge.value) : null,
        maxAge: form.maxAge.value ? Number(form.maxAge.value) : null,
        maxIncome: form.maxIncome.value ? Number(form.maxIncome.value) : null,
        gender: form.gender.value || "any",
        states: form.states.selectedOptions
          ? Array.from(form.states.selectedOptions).map(o => o.value).filter(v => v !== "")
          : [],
        casteCategory: form.casteCategory.selectedOptions
          ? Array.from(form.casteCategory.selectedOptions).map(o => o.value).filter(v => v !== "")
          : [],
        occupation: form.occupation.selectedOptions
          ? Array.from(form.occupation.selectedOptions).map(o => o.value).filter(v => v !== "")
          : [],
      }
    };

    try {
      const url = `${ADMIN_API}/api/admin/schemes${editingScheme ? `/${editingScheme._id}` : ""}`;
      const method = editingScheme ? "put" : "post";
      await axios[method](url, payload, {
        headers: { "x-admin-secret": adminSecret },
      });
      showToast(editingScheme ? "Scheme updated" : "Scheme created");
      form.reset();
      setEditingScheme(null);
      fetchAdminSchemes();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to save scheme", "error");
    }
  };

  const startEditScheme = (s) => {
    setEditingScheme(s);
  };

  const toggleActive = async (id) => {
    try {
      await axios.patch(
        `${ADMIN_API}/api/admin/schemes/${id}/toggle-active`,
        {},
        { headers: { "x-admin-secret": adminSecret } }
      );
      fetchAdminSchemes();
    } catch (err) {
      showToast("Failed to toggle scheme", "error");
    }
  };

  const deleteScheme = async (id) => {
    if (!confirm("Delete this scheme permanently?")) return;
    try {
      await axios.delete(`${ADMIN_API}/api/admin/schemes/${id}`, {
        headers: { "x-admin-secret": adminSecret },
      });
      showToast("Scheme deleted");
      fetchAdminSchemes();
    } catch (err) {
      showToast("Failed to delete scheme", "error");
    }
  };

  return (
    <div style={{ fontFamily:"'DM Sans', system-ui, sans-serif", minHeight:"100vh", background:"#f7f8fc", color:"#1a1a2e" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Fraunces:ital,wght@0,600;1,400&family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin:0; padding:0; }
        body { margin:0; }
        ::-webkit-scrollbar { width:5px; } ::-webkit-scrollbar-thumb { background:#cbd5e1; border-radius:4px; }
        .nav-link { cursor:pointer; padding:8px 16px; border-radius:8px; font-size:14px; font-weight:500; color:#64748b; transition:all .2s; border:none; background:none; text-decoration:none; }
        .nav-link:hover { color:#1a1a2e; background:#f1f5f9; }
        .nav-link.active { color:#2563eb; background:#eff6ff; }
        .card { background:#fff; border-radius:16px; border:1px solid #e8ecf4; transition:box-shadow .2s, transform .2s; }
        .card:hover { box-shadow:0 8px 30px rgba(0,0,0,0.08); }
        .btn-primary { background:#2563eb; color:#fff; border:none; border-radius:10px; padding:11px 22px; font-size:14px; font-weight:600; cursor:pointer; transition:all .2s; font-family:inherit; }
        .btn-primary:hover { background:#1d4ed8; transform:translateY(-1px); }
        .btn-outline { background:transparent; color:#2563eb; border:1.5px solid #2563eb; border-radius:10px; padding:10px 20px; font-size:14px; font-weight:500; cursor:pointer; transition:all .2s; font-family:inherit; }
        .btn-outline:hover { background:#eff6ff; }
        .input { width:100%; padding:10px 14px; border:1.5px solid #e2e8f0; border-radius:10px; font-size:14px; font-family:inherit; color:#1a1a2e; outline:none; transition:border .2s; background:#fff; }
        .input:focus { border-color:#2563eb; }
        .badge { display:inline-block; font-size:11px; font-weight:600; padding:3px 10px; border-radius:20px; letter-spacing:.3px; }
        .tag-chip { display:inline-flex; align-items:center; gap:4px; font-size:12px; padding:4px 10px; border-radius:20px; font-weight:500; }
        .scheme-card { cursor:pointer; }
        .scheme-card:hover { transform:translateY(-2px); box-shadow:0 12px 40px rgba(0,0,0,0.1); }
        @keyframes slideIn { from { transform:translateY(20px); opacity:0; } to { transform:translateY(0); opacity:1; } }
        @keyframes toastIn { from { transform:translateX(100%); opacity:0; } to { transform:translateX(0); opacity:1; } }
        .anim { animation: slideIn .35s ease both; }
        .anim-delay-1 { animation-delay:.05s; }
        .anim-delay-2 { animation-delay:.1s; }
        .anim-delay-3 { animation-delay:.15s; }
        .anim-delay-4 { animation-delay:.2s; }
        select.input { appearance:none; }
        .progress-bar { height:5px; border-radius:3px; background:#e2e8f0; overflow:hidden; }
        .progress-fill { height:100%; border-radius:3px; background:linear-gradient(90deg,#2563eb,#7c3aed); transition:width .5s; }
        .stat-card { background:#fff; border-radius:14px; border:1px solid #e8ecf4; padding:20px; }
        .notif-dot { width:8px; height:8px; background:#ef4444; border-radius:50%; display:inline-block; }
        .pill-tab { padding:7px 16px; border-radius:20px; font-size:13px; font-weight:500; cursor:pointer; border:1.5px solid #e2e8f0; background:#fff; color:#64748b; transition:all .2s; font-family:inherit; }
        .pill-tab.active { background:#2563eb; color:#fff; border-color:#2563eb; }
        .pill-tab:hover:not(.active) { border-color:#2563eb; color:#2563eb; }
        .hero-title { font-family:'Fraunces', serif; font-size:52px; font-weight:600; line-height:1.1; color:#0f172a; }
        .hero-sub { font-family:'Fraunces', serif; font-style:italic; color:#2563eb; }

        /* Cloned myScheme styles */
        .btn-green { background:#1e8b4e; color:#fff; border:none; border-radius:6px; padding:10px 20px; font-size:14px; font-weight:600; cursor:pointer; transition:all .2s; font-family:'Inter', sans-serif; display:flex; align-items:center; gap:6px; text-decoration:none; }
        .btn-green:hover { background:#167340; }
        .search-input { width:100%; padding:10px 16px 10px 36px; border:1px solid #d1d5db; border-radius:6px; font-size:14px; outline:none; transition:border .2s; background:#fff url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="%239ca3af" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>') no-repeat 10px center; background-size:16px; }
        .search-input:focus { border-color:#1e8b4e; }
        .cat-tab { padding:8px 16px; font-size:14px; font-weight:600; cursor:pointer; border:none; background:transparent; color:#555; transition:all .2s; border-radius:4px; font-family:'Inter', sans-serif; }
        .cat-tab.active { background:#e8f4ed; color:#1e8b4e; }
        .cat-tab:hover:not(.active) { background:#f3f4f6; }
        .category-card { display:flex; flex-direction:column; align-items:center; text-align:center; padding:16px; cursor:pointer; transition:transform .2s; font-family:'Inter', sans-serif; }
        .category-card:hover { transform:translateY(-4px); }
        .cat-icon-wrapper { width:64px; height:64px; border-radius:50%; background:#e8f0fe; display:flex; justify-content:center; align-items:center; margin-bottom:12px; font-size:28px; }
        .step-card { background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:32px 24px; text-align:center; flex:1; position:relative; box-shadow:0 4px 6px -1px rgba(0,0,0,0.05); font-family:'Inter', sans-serif; }
        .arrow-right { position:absolute; right:-24px; top:50%; transform:translateY(-50%); color:#cbd5e1; font-size:32px; z-index:10; }
        @media (max-width: 768px) { 
          .arrow-right { display:none; } 
          .step-container { flex-direction:column; }
          .hero-content { flex-direction:column !important; text-align:center !important; padding-top: 20px; }
          .hero-image-wrapper { display:none !important; }
          .hero-text h1 { font-size: 32px !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .dashboard-grid { grid-template-columns: 1fr !important; }
          .profile-grid { grid-template-columns: 1fr !important; }
          .admin-grid { grid-template-columns: 1fr !important; }
          .browse-schemes-layout { flex-direction: column !important; }
          .browse-sidebar { width: 100% !important; position: static !important; margin-bottom: 20px; }
          .nav-links-container { flex-wrap: wrap; justify-content: center; width: 100%; }
        }
        @media (max-width: 480px) {
          .stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Navbar */}
      <nav style={{ background:"#fff", borderBottom:"1px solid #e5e7eb", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"12px 24px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
          {/* Logo */}
          <div style={{ display:"flex", alignItems:"center", gap:12, cursor:"pointer" }} onClick={()=>setPage("home")}>
            <div style={{ width:40, height:40, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>🇮🇳</div>
            <div style={{ fontFamily:"'Inter',sans-serif", fontSize:24, fontWeight:700, color:"#1e8b4e", display:"flex", alignItems:"center" }}>
              YojanaTrack
            </div>
            <div style={{ width:1, height:30, background:"#d1d5db", margin:"0 8px" }}></div>
            <div style={{ fontSize:10, color:"#666", maxWidth:60, lineHeight:1.2, fontWeight:600 }}>Digital India</div>
          </div>
          
          {/* Search */}
          <div style={{ flex:1, maxWidth:400, display:"none", "@media (minWidth: 768px)": { display:"block" } }}>
            <input type="text" className="search-input" placeholder="Enter scheme name to search..." />
          </div>

          {/* Actions */}
          <div className="nav-links-container" style={{ display:"flex", alignItems:"center", gap:16 }}>
            {currentUser ? (
              <>
                {navItems.filter(n => n.id !== "home").map(item => (
                  <button key={item.id} className="nav-link" style={{ background:"transparent", border:"none", cursor:"pointer", color: page===item.id ? "#1e8b4e" : "#4b5563", fontWeight: page===item.id ? 600 : 500 }} onClick={() => navigate("/" + item.id)}>
                    {item.label}
                  </button>
                ))}
                <button className="btn-green" onClick={()=>{ clearSession(); navigate("/login"); }}>Logout</button>
              </>
            ) : (
              <button className="btn-green" onClick={()=>navigate("/login")}>
                Sign In <span>→</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Toast */}
      {toast && (
        <div style={{ position:"fixed", bottom:24, right:24, zIndex:999, background: toast.type==="success"?"#0f172a":"#ef4444", color:"#fff", padding:"12px 20px", borderRadius:12, fontSize:14, fontWeight:500, animation:"toastIn .3s ease", boxShadow:"0 8px 24px rgba(0,0,0,0.2)" }}>
          {toast.type==="success" ? "✓" : "✗"} {toast.msg}
        </div>
      )}

      {/* Old Scheme Detail Modal Removed */}

      {/* ── LOGIN PAGE ── */}
      {page === "login" && (
        <div style={{ maxWidth:420, margin:"60px auto", padding:"0 24px", fontFamily:"'Inter',sans-serif" }}>
          <h1 style={{ fontSize:28, fontWeight:700, marginBottom:8, color:"#111" }}>Login</h1>
          <p style={{ color:"#4b5563", marginBottom:20 }}>Use your email and password to continue.</p>
          <div className="card" style={{ padding:24, border:"1px solid #e5e7eb", boxShadow:"0 4px 6px -1px rgba(0,0,0,0.05)" }}>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target;
                const email = form.email.value;
                const password = form.password.value;
                try {
                  const res = await axios.post(
                    `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/login`,
                    { email, password }
                  );
                  saveSession(res.data);
                  const role = res.data.user.role;
                  navigate(role === "admin" ? "/admin" : "/dashboard");
                } catch (err) {
                  showToast(err.response?.data?.error || "Invalid credentials", "error");
                }
              }}
              style={{ display:"flex", flexDirection:"column", gap:12, fontSize:14 }}
            >
              <label style={{ fontWeight:500, color:"#374151" }}>
                Email
                <input name="email" type="email" className="input" style={{ marginTop:4 }} required />
              </label>
              <label style={{ fontWeight:500, color:"#374151" }}>
                Password
                <input name="password" type="password" className="input" style={{ marginTop:4 }} required />
              </label>
              <button type="submit" className="btn-green" style={{ marginTop:8, justifyContent:"center", width:"100%" }}>Login</button>
            </form>
            <div style={{ marginTop:16, fontSize:14, color:"#6b7280", textAlign:"center" }}>
              New here?{" "}
              <span style={{ color:"#1e8b4e", cursor:"pointer", fontWeight:600 }} onClick={()=>navigate("/signup")}>
                Create an account
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── SIGNUP PAGE ── */}
      {page === "signup" && (
        <div style={{ maxWidth:420, margin:"60px auto", padding:"0 24px", fontFamily:"'Inter',sans-serif" }}>
          <h1 style={{ fontSize:28, fontWeight:700, marginBottom:8, color:"#111" }}>Sign up</h1>
          <p style={{ color:"#4b5563", marginBottom:20 }}>Create your account to get scheme recommendations.</p>
          <div className="card" style={{ padding:24, border:"1px solid #e5e7eb", boxShadow:"0 4px 6px -1px rgba(0,0,0,0.05)" }}>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target;
                const name = form.name.value;
                const email = form.email.value;
                const password = form.password.value;
                const params = new URLSearchParams(location.search);
                const inviteToken = params.get("token");
                const inviteEmail = params.get("email");

                try {
                  if (inviteToken) {
                    const res = await axios.post(
                      `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/admin/accept`,
                      {
                        token: inviteToken,
                        email: inviteEmail || email,
                        name,
                        password,
                      }
                    );
                    saveSession(res.data);
                    navigate("/admin");
                  } else {
                    const res = await axios.post(
                      `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/signup`,
                      { name, email, password }
                    );
                    saveSession(res.data);
                    navigate("/dashboard");
                  }
                } catch (err) {
                  showToast(err.response?.data?.error || "Signup failed", "error");
                }
              }}
              style={{ display:"flex", flexDirection:"column", gap:12, fontSize:14 }}
            >
              <label style={{ fontWeight:500, color:"#374151" }}>
                Full name
                <input name="name" className="input" style={{ marginTop:4 }} required />
              </label>
              <label style={{ fontWeight:500, color:"#374151" }}>
                Email
                <input
                  name="email"
                  type="email"
                  className="input"
                  style={{ marginTop:4 }}
                  defaultValue={new URLSearchParams(location.search).get("email") || ""}
                  required
                />
              </label>
              <label style={{ fontWeight:500, color:"#374151" }}>
                Password
                <input name="password" type="password" className="input" style={{ marginTop:4 }} required />
              </label>
              <button type="submit" className="btn-green" style={{ marginTop:8, justifyContent:"center", width:"100%" }}>Create account</button>
            </form>
            <div style={{ marginTop:16, fontSize:14, color:"#6b7280", textAlign:"center" }}>
              Already have an account?{" "}
              <span style={{ color:"#1e8b4e", cursor:"pointer", fontWeight:600 }} onClick={()=>navigate("/login")}>
                Login
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── HOME PAGE ── */}
      {page === "home" && (
        <div style={{ background:"#fff", fontFamily:"'Inter',sans-serif" }}>
          {/* Hero Carousel */}
          <div style={{ background:"linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)", padding:"60px 24px", position:"relative", overflow:"hidden" }}>
            <div style={{ maxWidth:1200, margin:"0 auto", position:"relative", minHeight:340, display:"flex", alignItems:"center" }}>
              {dbSchemes.length > 0 ? dbSchemes.slice(0, 4).map((scheme, idx) => (
                <div 
                  key={scheme._id || idx} 
                  className="hero-content"
                  style={{ 
                    position:"absolute", 
                    top:0, left:0, width:"100%", height:"100%", 
                    display: "flex", alignItems:"center", justifyContent:"space-between", gap:40,
                    opacity: heroSlide === idx ? 1 : 0, 
                    transform: `translateX(${(idx - heroSlide) * 50}px)`,
                    transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                    pointerEvents: heroSlide === idx ? "auto" : "none"
                  }}
                >
                  <div className="hero-text" style={{ flex:1, maxWidth:600 }}>
                    <div style={{ display:"inline-block", padding:"6px 16px", background:"#1e8b4e", color:"#fff", fontSize:12, fontWeight:700, borderRadius:100, marginBottom:16, textTransform:"uppercase", letterSpacing:1 }}>
                      {scheme.category || "Latest Scheme"}
                    </div>
                    <h1 style={{ fontSize:42, fontWeight:800, color:"#111", lineHeight:1.2, marginBottom:16 }}>
                      {scheme.name}
                    </h1>
                    <p style={{ fontSize:18, color:"#374151", lineHeight:1.6, marginBottom:32, display:"-webkit-box", WebkitLineClamp:3, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
                      {scheme.description}
                    </p>
                    <div style={{ display:"flex", gap:16 }}>
                      <button className="btn-green" style={{ fontSize:16, padding:"14px 32px" }} onClick={()=>{ setSelectedScheme(scheme); setDetailTab("details"); navigate("/scheme/" + (scheme.id || scheme._id)); }}>
                        Know More
                      </button>
                      <button className="btn-outline" style={{ fontSize:16, padding:"14px 32px", background:"#fff" }} onClick={()=>{setWizardStep(1); navigate("/wizard");}}>
                        Check Eligibility
                      </button>
                    </div>
                  </div>
                  <div className="hero-image-wrapper" style={{ flex:1, display:"flex", justifyContent:"flex-end" }}>
                    <div style={{ width:400, height:300, background:"#fff", borderRadius:24, boxShadow:"0 20px 25px -5px rgba(0,0,0,0.05)", padding:32, display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", textAlign:"center", border:"1px solid #e5e7eb" }}>
                      <div style={{ width:80, height:80, background:categoryBg[scheme.category] || "#f3f4f6", borderRadius:20, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:20 }}>
                        <span style={{ fontSize:24, fontWeight:800, color:"#111" }}>{scheme.category?.substring(0,3).toUpperCase() || "GOV"}</span>
                      </div>
                      <h3 style={{ fontSize:20, fontWeight:700, color:"#111", marginBottom:8 }}>Government of India</h3>
                      <p style={{ color:"#4b5563" }}>{scheme.ministry || "Empowering Citizens"}</p>
                    </div>
                  </div>
                </div>
              )) : (
                <div style={{ textAlign:"center", width:"100%" }}>Loading schemes...</div>
              )}
              
              {/* Carousel Indicators */}
              <div style={{ position:"absolute", bottom:-20, left:"50%", transform:"translateX(-50%)", display:"flex", gap:8 }}>
                {dbSchemes.slice(0, Math.min(dbSchemes.length, 4)).map((_, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setHeroSlide(idx)}
                    style={{ 
                      width: heroSlide === idx ? 24 : 8, height:8, borderRadius:4, 
                      background: heroSlide === idx ? "#1e8b4e" : "#cbd5e1", 
                      border:"none", cursor:"pointer", transition:"all 0.3s" 
                    }} 
                  />
                ))}
              </div>
            </div>
          </div>

          <div style={{ maxWidth:1200, margin:"0 auto", padding:"40px 24px" }}>
            <div style={{ display:"flex", justifyContent:"center", gap:24, flexWrap:"wrap" }}>
              {[
                { count:"4690+", label:"Total Schemes" },
                { count:"670+", label:"Central Schemes" },
                { count:"4020+", label:"States/UTs Schemes" },
              ].map(stat => (
                <div key={stat.label} style={{ background:"#fff", borderRadius:12, padding:"32px 48px", minWidth:260, border:"1px solid #e5e7eb", boxShadow:"0 4px 6px -1px rgba(0,0,0,0.05)" }}>
                  <div style={{ fontSize:40, fontWeight:700, color:"#111", marginBottom:8 }}>{stat.count}</div>
                  <div style={{ fontSize:15, color:"#4b5563", display:"flex", alignItems:"center", justifyContent:"center", gap:4 }}>
                    {stat.label} <span style={{color:"#1e8b4e"}}>→</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div style={{ maxWidth:1200, margin:"80px auto", padding:"0 24px" }}>
            <div style={{ display:"flex", justifyContent:"center", gap:8, marginBottom:40 }}>
              <button className="cat-tab active">Categories</button>
              <button className="cat-tab">States/UTs</button>
              <button className="cat-tab">Central Ministries</button>
            </div>
            <h2 style={{ fontSize:32, fontWeight:800, textAlign:"center", marginBottom:56, color:"#111" }}>
              Find schemes based<br/>on categories
            </h2>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:24 }}>
              {[
                { icon:<Wheat size={24}/>, count:843, label:"Agriculture,Rural &\nEnvironment", color:"#1e8b4e", bg:"#d1e7dd" },
                { icon:<Landmark size={24}/>, count:328, label:"Banking,Financial\nServices and Insurance", color:"#d97706", bg:"#fef3c7" },
                { icon:<Briefcase size={24}/>, count:754, label:"Business &\nEntrepreneurship", color:"#2563eb", bg:"#dbeafe" },
                { icon:<GraduationCap size={24}/>, count:1096, label:"Education & Learning", color:"#dc2626", bg:"#fee2e2" },
                { icon:<HeartPulse size={24}/>, count:287, label:"Health & Wellness", color:"#0d9488", bg:"#ccfbf1" },
                { icon:<Home size={24}/>, count:134, label:"Housing & Shelter", color:"#4f46e5", bg:"#e0e7ff" },
                { icon:<Scale size={24}/>, count:35, label:"Public Safety,Law &\nJustice", color:"#be123c", bg:"#ffe4e6" },
                { icon:<Microscope size={24}/>, count:114, label:"Science, IT &\nCommunications", color:"#4338ca", bg:"#e0e7ff" },
                { icon:<BarChart size={24}/>, count:401, label:"Skills & Employment", color:"#b45309", bg:"#fef3c7" },
                { icon:<Users size={24}/>, count:1448, label:"Social welfare &\nEmpowerment", color:"#c026d3", bg:"#fae8ff" },
                { icon:<Medal size={24}/>, count:261, label:"Sports & Culture", color:"#15803d", bg:"#dcfce7" },
                { icon:<Bus size={24}/>, count:105, label:"Transport &\nInfrastructure", color:"#b45309", bg:"#fef3c7" },
                { icon:<Plane size={24}/>, count:97, label:"Travel & Tourism", color:"#db2777", bg:"#fce7f3" },
                { icon:<Droplets size={24}/>, count:59, label:"Utility & Sanitation", color:"#6b21a8", bg:"#f3e8ff" },
                { icon:<Baby size={24}/>, count:472, label:"Women and Child", color:"#0369a1", bg:"#e0f2fe" },
              ].map(cat => (
                <div key={cat.label} className="category-card" onClick={()=>navigate("/schemes")}>
                  <div className="cat-icon-wrapper" style={{ background:cat.bg }}>
                    <span style={{ color:cat.color }}>{cat.icon}</span>
                  </div>
                  <div style={{ fontSize:13, fontWeight:600, color:cat.color, marginBottom:6 }}>{cat.count} Schemes</div>
                  <div style={{ fontSize:15, fontWeight:500, color:"#374151", whiteSpace:"pre-line", lineHeight:1.4 }}>{cat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* How it works */}
          <div style={{ maxWidth:1000, margin:"100px auto 120px", padding:"0 24px" }}>
            <div style={{ textAlign:"center", marginBottom:56 }}>
              <div style={{ fontSize:15, color:"#6b7280", fontWeight:500, marginBottom:8 }}>How it works</div>
              <h2 style={{ fontSize:36, fontWeight:800, color:"#111" }}>Easy steps to apply<br/>for Government Schemes</h2>
            </div>
            
            <div className="step-container" style={{ display:"flex", gap:32, position:"relative" }}>
              <div className="step-card">
                <div style={{ marginBottom:20 }}><ClipboardList size={56} color="#1e8b4e" strokeWidth={1.5} /></div>
                <h3 style={{ fontSize:20, fontWeight:600, color:"#1e8b4e", marginBottom:12 }}>Enter Details</h3>
                <p style={{ fontSize:15, color:"#4b5563", lineHeight:1.5 }}>Start by entering your <strong>basic details!</strong></p>
                <div className="arrow-right">»</div>
              </div>
              <div className="step-card">
                <div style={{ marginBottom:20 }}><Search size={56} color="#1e8b4e" strokeWidth={1.5} /></div>
                <h3 style={{ fontSize:20, fontWeight:600, color:"#1e8b4e", marginBottom:12 }}>Search</h3>
                <p style={{ fontSize:15, color:"#4b5563", lineHeight:1.5 }}>Our search engine will <strong>find the relevant schemes!</strong></p>
                <div className="arrow-right">»</div>
              </div>
              <div className="step-card">
                <div style={{ marginBottom:20 }}><MousePointerClick size={56} color="#1e8b4e" strokeWidth={1.5} /></div>
                <h3 style={{ fontSize:20, fontWeight:600, color:"#1e8b4e", marginBottom:12 }}>Select & Apply</h3>
                <p style={{ fontSize:15, color:"#4b5563", lineHeight:1.5 }}><strong>Select and apply</strong> for the best suited scheme</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── WIZARD PAGE ── */}
      {page === "wizard" && (
        <div style={{ maxWidth:700, margin:"40px auto", padding:"0 24px", fontFamily:"'Inter',sans-serif" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:32 }}>
            <h1 style={{ fontSize:28, fontWeight:800, color:"#111" }}>Find Schemes For You</h1>
            <div style={{ fontSize:14, fontWeight:600, color:"#6b7280" }}>Step {wizardStep} of 5</div>
          </div>
          <div className="progress-bar" style={{ marginBottom:32, background:"#e5e7eb", height:6 }}>
            <div className="progress-fill" style={{ width:`${(wizardStep/5)*100}%`, background:"#1e8b4e" }}/>
          </div>

          <div className="card" style={{ padding:32, border:"1px solid #e5e7eb", boxShadow:"0 4px 6px -1px rgba(0,0,0,0.05)" }}>
            {wizardStep === 1 && (
              <div className="anim">
                <h2 style={{ fontSize:20, fontWeight:700, marginBottom:24 }}>Tell us about yourself</h2>
                <label style={{ display:"block", fontWeight:600, color:"#374151", marginBottom:8 }}>Gender</label>
                <select className="input" style={{ marginBottom:20 }} value={profile.gender} onChange={e=>setProfile({...profile, gender:e.target.value})}>
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Transgender</option>
                </select>
                <label style={{ display:"block", fontWeight:600, color:"#374151", marginBottom:8 }}>Age</label>
                <input type="number" className="input" placeholder="Enter your age" value={profile.age} onChange={e=>setProfile({...profile, age:e.target.value})} />
              </div>
            )}
            {wizardStep === 2 && (
              <div className="anim">
                <h2 style={{ fontSize:20, fontWeight:700, marginBottom:24 }}>Where do you live?</h2>
                <label style={{ display:"block", fontWeight:600, color:"#374151", marginBottom:8 }}>State</label>
                <select className="input" style={{ marginBottom:20 }} value={profile.state} onChange={e=>setProfile({...profile, state:e.target.value})}>
                  <option value="">Select State</option>
                  {STATES.map(s=><option key={s} value={s}>{s}</option>)}
                </select>
                <label style={{ display:"block", fontWeight:600, color:"#374151", marginBottom:8 }}>Area of Residence</label>
                <div style={{ display:"flex", gap:16 }}>
                  {["Urban", "Rural"].map(area=>(
                    <label key={area} style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
                      <input type="radio" name="area" checked={profile.area===area} onChange={()=>setProfile({...profile, area})} /> {area}
                    </label>
                  ))}
                </div>
              </div>
            )}
            {wizardStep === 3 && (
              <div className="anim">
                <h2 style={{ fontSize:20, fontWeight:700, marginBottom:24 }}>Social Details</h2>
                <label style={{ display:"block", fontWeight:600, color:"#374151", marginBottom:8 }}>Caste Category</label>
                <select className="input" style={{ marginBottom:20 }} value={profile.casteCategory} onChange={e=>setProfile({...profile, casteCategory:e.target.value})}>
                  <option value="">Select Category</option>
                  <option value="general">General</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                </select>
                <label style={{ display:"block", fontWeight:600, color:"#374151", marginBottom:8 }}>Are you differently abled?</label>
                <div style={{ display:"flex", gap:16 }}>
                  {["Yes", "No"].map(opt=>(
                    <label key={opt} style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
                      <input type="radio" name="disabled" checked={profile.disabled===opt} onChange={()=>setProfile({...profile, disabled:opt})} /> {opt}
                    </label>
                  ))}
                </div>
              </div>
            )}
            {wizardStep === 4 && (
              <div className="anim">
                <h2 style={{ fontSize:20, fontWeight:700, marginBottom:24 }}>Employment & Education</h2>
                <label style={{ display:"block", fontWeight:600, color:"#374151", marginBottom:8 }}>Are you a student?</label>
                <div style={{ display:"flex", gap:16, marginBottom:20 }}>
                  {["Yes", "No"].map(opt=>(
                    <label key={opt} style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
                      <input type="radio" name="student" checked={profile.student===opt} onChange={()=>{
                        setProfile({...profile, student:opt, occupation: opt==="Yes"?"student":profile.occupation});
                      }} /> {opt}
                    </label>
                  ))}
                </div>
                {profile.student === "No" && (
                  <>
                    <label style={{ display:"block", fontWeight:600, color:"#374151", marginBottom:8 }}>Current Employment Status</label>
                    <select className="input" value={profile.occupation} onChange={e=>setProfile({...profile, occupation:e.target.value})}>
                      <option value="">Select Status</option>
                      <option value="employed">Employed</option>
                      <option value="unemployed">Unemployed</option>
                      <option value="self-employed">Self-Employed / Entrepreneur</option>
                      <option value="farmer">Farmer</option>
                    </select>
                  </>
                )}
              </div>
            )}
            {wizardStep === 5 && (
              <div className="anim">
                <h2 style={{ fontSize:20, fontWeight:700, marginBottom:24 }}>Financial Details</h2>
                <label style={{ display:"block", fontWeight:600, color:"#374151", marginBottom:8 }}>Do you belong to BPL (Below Poverty Line) category?</label>
                <div style={{ display:"flex", gap:16, marginBottom:20 }}>
                  {["Yes", "No"].map(opt=>(
                    <label key={opt} style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
                      <input type="radio" name="bpl" checked={profile.bpl===opt} onChange={()=>setProfile({...profile, bpl:opt})} /> {opt}
                    </label>
                  ))}
                </div>
                <label style={{ display:"block", fontWeight:600, color:"#374151", marginBottom:8 }}>Family Annual Income (₹)</label>
                <input type="number" className="input" placeholder="e.g. 200000" value={profile.income} onChange={e=>setProfile({...profile, income:e.target.value})} />
              </div>
            )}

            <div style={{ display:"flex", justifyContent:"space-between", marginTop:32, paddingTop:24, borderTop:"1px solid #e5e7eb" }}>
              <button className="btn-outline" style={{ borderColor:"#d1d5db", color:"#4b5563" }} onClick={()=>{ if(wizardStep>1) setWizardStep(wizardStep-1); else navigate("/"); }}>
                {wizardStep === 1 ? "Cancel" : "Back"}
              </button>
              <button className="btn-green" onClick={()=>{
                if (wizardStep < 5) {
                  setWizardStep(wizardStep+1);
                } else {
                  setProfileSaved(true);
                  navigate("/schemes");
                }
              }}>
                {wizardStep === 5 ? "Submit" : "Next"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SCHEMES PAGE ── */}
      {page === "schemes" && (
        <div style={{ maxWidth:1200, margin:"32px auto", padding:"0 24px", fontFamily:"'Inter',sans-serif" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24, flexWrap:"wrap", gap:16 }}>
            <h1 style={{ fontSize:28, fontWeight:800, color:"#111" }}>Browse Schemes</h1>
            <div style={{ position:"relative", width:"100%", maxWidth:360 }}>
              <div style={{ position:"absolute", left:12, top:10, color:"#9ca3af", pointerEvents:"none" }}>
                <Search size={18} />
              </div>
              <input className="input" style={{ width:"100%", borderRadius:20, paddingLeft:38 }} placeholder="Search schemes..." value={search} onChange={e=>setSearch(e.target.value)} />
            </div>
          </div>
          
          {profileSaved && (
            <div style={{ background:"#e8f4ed", border:"1px solid #d1e7dd", borderRadius:8, padding:"12px 16px", marginBottom:24, fontSize:14, color:"#1e8b4e", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <CheckCircle size={18} /> Showing <strong>{matched.length}</strong> schemes based on your profile.
              </div>
              <button style={{ background:"none", border:"none", color:"#1e8b4e", fontWeight:600, textDecoration:"underline", cursor:"pointer" }} onClick={()=>{setWizardStep(1); navigate("/wizard");}}>Edit Profile</button>
            </div>
          )}

          <div className="browse-schemes-layout" style={{ display:"flex", gap:32, alignItems:"flex-start", flexWrap:"wrap" }}>
            {/* Left Sidebar Filter */}
            <div className="browse-sidebar" style={{ width:260, flexShrink:0, background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:20, position:"sticky", top:80 }}>
              <h3 style={{ fontSize:16, fontWeight:700, marginBottom:16, color:"#111" }}>Filter by</h3>
              
              <div style={{ marginBottom:20 }}>
                <label style={{ fontSize:13, fontWeight:600, color:"#4b5563", display:"block", marginBottom:8 }}>State</label>
                <select className="input" value={filterState} onChange={e=>setFilterState(e.target.value)}>
                  <option value="All">All States</option>
                  <option value="Central">Central Govt Schemes</option>
                  {STATES.map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div style={{ marginBottom:20 }}>
                <label style={{ fontSize:13, fontWeight:600, color:"#4b5563", display:"block", marginBottom:8 }}>Ministry</label>
                <select className="input" value={filterMinistry} onChange={e=>setFilterMinistry(e.target.value)}>
                  <option value="All">All Ministries</option>
                  {[...new Set(dbSchemes.map(s=>s.ministry))].filter(Boolean).map(m=><option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div style={{ marginBottom:20 }}>
                <label style={{ fontSize:13, fontWeight:600, color:"#4b5563", display:"block", marginBottom:8 }}>Category</label>
                <select className="input" value={category} onChange={e=>setCategory(e.target.value)}>
                  {CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {profileSaved && (
                <div style={{ marginBottom:20, padding:"12px", background:"#f0fdf4", borderRadius:8, border:"1px solid #bbf7d0" }}>
                  <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:13, fontWeight:600, color:"#15803d" }}>
                    <input type="checkbox" checked={showEligibleOnly} onChange={e=>setShowEligibleOnly(e.target.checked)} />
                    Show eligible schemes only
                  </label>
                </div>
              )}
            </div>

            {/* Right Main Grid */}
            <div style={{ flex:1, minWidth:300 }}>
              <div style={{ fontSize:14, color:"#6b7280", marginBottom:16, fontWeight:500 }}>Total <strong>{filtered.length}</strong> Schemes found</div>
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                {filtered.map((s,i) => {
                  const elig = profileSaved ? isEligible(user, s) : null;
                  const schemeId = s._id || s.id;
                  const c = s.criteria || s.eligibilityCriteria || {};
                  return (
                    <div key={schemeId} className={`card anim`} style={{ padding:24, display:"flex", gap:20, border:"1px solid #e5e7eb", borderRadius:12, animationDelay:`${i*0.04}s`, cursor:"pointer", flexDirection: "column" }} onClick={()=>{ setSelectedScheme(s); setDetailTab("details"); navigate("/scheme/" + schemeId); }}>
                      <div style={{ display:"flex", gap:20 }}>
                        <div style={{ width:60, height:60, background:categoryBg[s.category] || "#f3f4f6", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, color:categoryColors[s.category] || "#4b5563" }}>
                          {getCategoryIcon(s.category, 28)}
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                            <div>
                              <div style={{ fontSize:18, fontWeight:700, color:"#111", marginBottom:4 }}>{s.name}</div>
                              <div style={{ fontSize:13, color:"#6b7280", fontWeight:500 }}>{s.ministry}</div>
                            </div>
                            <span className="badge" style={{ background:"#f3f4f6", color:"#374151", fontSize:12, padding:"4px 12px" }}>{s.state}</span>
                          </div>
                          <p style={{ fontSize:14, color:"#4b5563", lineHeight:1.6, marginTop:12, marginBottom:16 }}>{s.description}</p>
                          <div style={{ display:"flex", gap:16, flexWrap:"wrap", alignItems:"center" }}>
                            <span style={{ fontSize:13, fontWeight:600, color:"#2563eb", display:"flex", alignItems:"center", gap:4 }}>
                              <Coins size={16} /> {s.benefit}
                            </span>
                            {profileSaved && elig !== null && (
                              <span style={{ fontSize:12, fontWeight:600, padding:"4px 8px", borderRadius:4, background:elig?"#dcfce7":"#fee2e2", color:elig?"#166534":"#991b1b" }}>
                                {elig ? "✓ You are Eligible" : "✗ Not Eligible"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Criteria Footer */}
                      <div style={{ marginTop: 8, paddingTop: 16, borderTop: "1px dashed #e5e7eb", display: "flex", gap: 16, flexWrap: "wrap", fontSize: 12, color: "#6b7280" }}>
                        <span style={{ display:"flex", alignItems:"center", gap:4 }}>
                          <span style={{fontWeight:600}}>State:</span> {c.states?.length ? c.states.join(", ") : "All India"}
                        </span>
                        {c.maxIncome && (
                          <span style={{ display:"flex", alignItems:"center", gap:4 }}>
                             <span style={{fontWeight:600}}>Income Limit:</span> ₹{c.maxIncome.toLocaleString()}
                          </span>
                        )}
                        {c.casteCategory?.length > 0 && (
                          <span style={{ display:"flex", alignItems:"center", gap:4 }}>
                             <span style={{fontWeight:600}}>Caste:</span> {c.casteCategory.join(", ")}
                          </span>
                        )}
                        {c.gender && c.gender !== "any" && (
                          <span style={{ display:"flex", alignItems:"center", gap:4 }}>
                             <span style={{fontWeight:600}}>Gender:</span> {c.gender}
                          </span>
                        )}
                        {c.minAge && (
                          <span style={{ display:"flex", alignItems:"center", gap:4 }}>
                             <span style={{fontWeight:600}}>Age:</span> {c.minAge}+
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── SCHEME DETAILS PAGE ── */}
      {page === "scheme-details" && selectedScheme && (
        <div style={{ maxWidth:1200, margin:"32px auto", padding:"0 24px", fontFamily:"'Inter',sans-serif" }}>
          {/* Header */}
          <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:32, marginBottom:24, display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:20 }}>
            <div style={{ display:"flex", gap:24, alignItems:"center" }}>
              <div>
                <div style={{ display:"inline-block", padding:"4px 12px", background:categoryBg[selectedScheme.category] || "#f3f4f6", color:"#111", fontSize:12, fontWeight:700, borderRadius:100, marginBottom:12, textTransform:"uppercase", letterSpacing:0.5 }}>
                  {selectedScheme.category || "General"}
                </div>
                <h1 style={{ fontSize:28, fontWeight:800, color:"#111", marginBottom:8 }}>{selectedScheme.name}</h1>
                <div style={{ fontSize:15, color:"#4b5563", fontWeight:500, display:"flex", gap:12, alignItems:"center", flexWrap:"wrap" }}>
                  <span className="badge" style={{ background:"#f3f4f6", color:"#374151" }}>{selectedScheme.state || "Central"}</span>
                </div>
              </div>
            </div>
            <div style={{ display:"flex", gap:12 }}>
              <button className="btn-outline" onClick={()=>{ toggleBookmark(selectedScheme.id); }}>
                {bookmarks.includes(selectedScheme.id) ? "🔖 Saved" : "🔖 Save"}
              </button>
            </div>
          </div>

          <div style={{ display:"flex", gap:32, alignItems:"flex-start", flexWrap:"wrap" }}>
            {/* Left Nav */}
            <div className="browse-sidebar" style={{ width:240, flexShrink:0, background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:16, position:"sticky", top:80 }}>
              {[
                { id:"details", label:"Details" },
                { id:"eligibility", label:"Eligibility" },
              ].map(tab=>(
                <button key={tab.id} style={{ display:"block", width:"100%", textAlign:"left", padding:"12px 16px", background:detailTab===tab.id?"#e8f4ed":"transparent", color:detailTab===tab.id?"#1e8b4e":"#4b5563", fontWeight:detailTab===tab.id?700:500, border:"none", borderRadius:8, cursor:"pointer", fontSize:14, marginBottom:4, fontFamily:"'Inter',sans-serif", transition:"all .2s" }} onClick={()=>setDetailTab(tab.id)}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Right Content */}
            <div style={{ flex:1, minWidth:300, background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:32, minHeight:400 }}>
              {detailTab === "details" && (
                <div className="anim">
                  <h2 style={{ fontSize:24, fontWeight:700, marginBottom:20, color:"#111" }}>Scheme Details</h2>
                  <p style={{ fontSize:15, color:"#374151", lineHeight:1.7, whiteSpace:"pre-line" }}>{selectedScheme.description}</p>
                </div>
              )}

              {detailTab === "eligibility" && (
                <div className="anim">
                  <h2 style={{ fontSize:24, fontWeight:700, marginBottom:20, color:"#111" }}>Eligibility</h2>
                  <ul style={{ paddingLeft:20, color:"#374151", fontSize:15, lineHeight:1.8 }}>
                    {selectedScheme.criteria.minAge && <li>Minimum Age: {selectedScheme.criteria.minAge} years</li>}
                    {selectedScheme.criteria.maxAge && <li>Maximum Age: {selectedScheme.criteria.maxAge} years</li>}
                    {selectedScheme.criteria.maxIncome && <li>Family Income must be less than ₹{selectedScheme.criteria.maxIncome}</li>}
                    {selectedScheme.criteria.gender && <li>Gender: {selectedScheme.criteria.gender.charAt(0).toUpperCase() + selectedScheme.criteria.gender.slice(1)}</li>}
                    {selectedScheme.criteria.occupation && <li>Occupation: {selectedScheme.criteria.occupation.join(', ')}</li>}
                    {selectedScheme.criteria.casteCategory && <li>Category: {selectedScheme.criteria.casteCategory.join(', ')}</li>}
                  </ul>
                  
                  <div style={{ marginTop:32, borderTop:"1px solid #e5e7eb", paddingTop:24 }}>
                    <div style={{ fontSize:15, fontWeight:600, marginBottom:12 }}>Check your eligibility automatically:</div>
                    <button className="btn-outline" onClick={()=>{setWizardStep(1); navigate("/wizard");}}>Run Eligibility Check</button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ── SETTINGS PAGE ── */}
      {page === "settings" && (
        <div className="browse-schemes-layout" style={{ maxWidth:900, margin:"40px auto", padding:"0 24px", display:"flex", gap:"32px", alignItems:"flex-start" }}>
          {/* Sidebar */}
          <div className="browse-sidebar" style={{ width:240, flexShrink:0, background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:16, position:"sticky", top:80 }}>
            <h2 style={{ fontSize:18, fontWeight:700, marginBottom:16, paddingLeft:12 }}>Settings</h2>
            {[
              { id:"profile", label:"My Profile", icon:"👤" },
              { id:"preferences", label:"Preferences", icon:"⚙️" },
              { id:"security", label:"Security", icon:"🔒" },
            ].map(tab=>(
              <button key={tab.id} style={{ display:"flex", alignItems:"center", gap:12, width:"100%", textAlign:"left", padding:"12px 16px", background:settingsTab===tab.id?"#e8f4ed":"transparent", color:settingsTab===tab.id?"#1e8b4e":"#4b5563", fontWeight:settingsTab===tab.id?700:500, border:"none", borderRadius:8, cursor:"pointer", fontSize:14, marginBottom:4, fontFamily:"'Inter',sans-serif", transition:"all .2s" }} onClick={()=>setSettingsTab(tab.id)}>
                <span>{tab.icon}</span> {tab.label}
              </button>
            ))}
          </div>

          {/* Main Content */}
          <div style={{ flex:1, minWidth:300 }}>
            {settingsTab === "profile" && (
              <div className="anim">
                <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:28, marginBottom:6 }}>Your Profile</h1>
                <p style={{ color:"#64748b", marginBottom:24 }}>This is used to match you with government schemes automatically.</p>
                <div className="card" style={{ padding:28 }}>
                  <div className="profile-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
                    {[["Full name","name","text","Your full name"],["Age","age","number","Your age"],["Phone","phone","tel","10-digit mobile"],["Email","email","email","For notifications"]].map(([label,key,type,placeholder])=>(
                      <div key={key}>
                        <label style={{ fontSize:12, fontWeight:600, color:"#475569", display:"block", marginBottom:6 }}>{label}</label>
                        <input className="input" type={type} placeholder={placeholder} value={profile[key]} onChange={e=>setProfile(p=>({...p,[key]:e.target.value}))} style={{ gridColumn: key==="name"||key==="email"?"span 2":"auto" }}/>
                      </div>
                    ))}
                  </div>
                  <div className="profile-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:16 }}>
                    {[
                      ["Annual income (₹)","income","number","e.g. 200000"],
                      ["Gender","gender","select",["male","female","other"]],
                      ["State","state","select",STATES],
                      ["Occupation","occupation","select",["farmer","student","salaried","business","self-employed","unemployed"]],
                      ["Caste category","casteCategory","select",["general","OBC","SC","ST"]],
                    ].map(([label,key,type,options])=>(
                      <div key={key}>
                        <label style={{ fontSize:12, fontWeight:600, color:"#475569", display:"block", marginBottom:6 }}>{label.toUpperCase()}</label>
                        {type==="select" ? (
                          <select className="input" value={profile[key]} onChange={e=>setProfile(p=>({...p,[key]:e.target.value}))}>
                            {options.map(o=><option key={o} value={o}>{o.charAt(0).toUpperCase()+o.slice(1)}</option>)}
                          </select>
                        ) : (
                          <input className="input" type={type} placeholder={options} value={profile[key]} onChange={e=>setProfile(p=>({...p,[key]:e.target.value}))}/>
                        )}
                      </div>
                    ))}
                  </div>
                  <button className="btn-primary" style={{ width:"100%", marginTop:8 }} onClick={async ()=>{ 
                    if (profile.age === "" || profile.income === "") {
                      showToast("Age and income are required", "error");
                      return;
                    }
                    try {
                      const token = getToken();
                      await axios.put(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/profile`, profile, {
                        headers: { Authorization: `Bearer ${token}` }
                      });
                      setProfileSaved(true); 
                      showToast("Profile saved! Checking your eligibility…"); 
                      setTimeout(()=>{
                        navigate("/dashboard");
                        setPage("dashboard");
                      }, 1200); 
                    } catch(e) {
                      showToast("Error saving profile", "error");
                    }
                  }}>
                    Save Profile & Check Eligibility
                  </button>
                </div>
                {profileSaved && (
                  <div className="card anim" style={{ padding:20, marginTop:16, background:"#f0fdf4", borderColor:"#bbf7d0" }}>
                    <div style={{ fontWeight:600, color:"#15803d", fontSize:14, marginBottom:6 }}>✓ Profile saved</div>
                    <div style={{ color:"#64748b", fontSize:13 }}>You're matched with <strong>{matched.length}</strong> schemes based on your current profile.</div>
                  </div>
                )}
              </div>
            )}

            {settingsTab === "preferences" && (
              <div className="anim">
                <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:28, marginBottom:6 }}>Preferences</h1>
                <p style={{ color:"#64748b", marginBottom:24 }}>Manage your website experience and notifications.</p>
                <div className="card" style={{ padding:28 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingBottom:16, borderBottom:"1px solid #e5e7eb" }}>
                    <div>
                      <div style={{ fontWeight:600, color:"#111" }}>Email Notifications</div>
                      <div style={{ fontSize:13, color:"#64748b", marginTop:4 }}>Receive alerts when new matching schemes are added.</div>
                    </div>
                    <input type="checkbox" defaultChecked style={{ width:20, height:20, accentColor:"#1e8b4e" }}/>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingBottom:16, paddingTop:16, borderBottom:"1px solid #e5e7eb" }}>
                    <div>
                      <div style={{ fontWeight:600, color:"#111" }}>Dark Mode</div>
                      <div style={{ fontSize:13, color:"#64748b", marginTop:4 }}>Toggle dark mode for better visibility at night.</div>
                    </div>
                    <input type="checkbox" style={{ width:20, height:20, accentColor:"#1e8b4e" }}/>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingTop:16 }}>
                    <div>
                      <div style={{ fontWeight:600, color:"#111" }}>SMS Alerts</div>
                      <div style={{ fontSize:13, color:"#64748b", marginTop:4 }}>Get important deadline reminders on your phone.</div>
                    </div>
                    <input type="checkbox" style={{ width:20, height:20, accentColor:"#1e8b4e" }}/>
                  </div>
                  <button className="btn-primary" style={{ marginTop:24 }} onClick={()=>showToast("Preferences saved!")}>Save Preferences</button>
                </div>
              </div>
            )}

            {settingsTab === "security" && (
              <div className="anim">
                <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:28, marginBottom:6 }}>Security</h1>
                <p style={{ color:"#64748b", marginBottom:24 }}>Keep your account safe and secure.</p>
                <div className="card" style={{ padding:28 }}>
                  <h3 style={{ fontSize:16, fontWeight:600, marginBottom:16 }}>Change Password</h3>
                  <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                    <label>
                      <span style={{ fontSize:12, fontWeight:600, color:"#475569", display:"block", marginBottom:6 }}>Current Password</span>
                      <input type="password" placeholder="••••••••" className="input" />
                    </label>
                    <label>
                      <span style={{ fontSize:12, fontWeight:600, color:"#475569", display:"block", marginBottom:6 }}>New Password</span>
                      <input type="password" placeholder="••••••••" className="input" />
                    </label>
                    <button className="btn-primary" style={{ width:"max-content", marginTop:8 }} onClick={()=>showToast("Password updated!")}>Update Password</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── DASHBOARD PAGE ── */}
      {page === "dashboard" && (
        <div style={{ maxWidth:1100, margin:"32px auto", padding:"0 24px" }}>
          <div style={{ marginBottom:24 }}>
            <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:30, marginBottom:4 }}>
              {profile.name ? `Welcome, ${profile.name.split(" ")[0]}` : "Your Dashboard"}
            </h1>
            <p style={{ color:"#64748b" }}>Here's everything matched and tracked for you</p>
          </div>

          {/* Stats row */}
          <div className="stats-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:28 }}>
            {[
              { label:"Eligible schemes", value:profileSaved?matched.length:"—", color:"#2563eb", bg:"#eff6ff" },
              { label:"Near matches", value:profileSaved?nearMiss.length:"—", color:"#d97706", bg:"#fffbeb" },
              { label:"Saved schemes", value:bookmarks.length, color:"#7c3aed", bg:"#f5f3ff" },
              { label:"Applied", value:applications.length, color:"#059669", bg:"#f0fdf4" },
            ].map(s=>(
              <div key={s.label} className="stat-card anim">
                <div style={{ fontSize:28, fontWeight:700, color:s.color, fontFamily:"'Fraunces',serif" }}>{s.value}</div>
                <div style={{ fontSize:13, color:"#64748b", marginTop:4 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {!profileSaved && (
            <div style={{ background:"#fffbeb", border:"1px solid #fde68a", borderRadius:14, padding:"20px 24px", marginBottom:24, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontWeight:600, color:"#92400e" }}>Your profile isn't set up yet</div>
                <div style={{ fontSize:13, color:"#78350f", marginTop:4 }}>Create a profile to see schemes you're eligible for</div>
              </div>
              <button className="btn-primary" onClick={()=>navigate("/settings")}>Set up profile →</button>
            </div>
          )}

          <div className="dashboard-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
            {/* Matched schemes */}
            <div>
              <h2 style={{ fontSize:18, fontWeight:600, marginBottom:14, display:"flex", alignItems:"center", gap:8 }}>
                <CheckCircle size={20} color="#15803d" /> Eligible Schemes
              </h2>
              {!profileSaved ? (
                <div className="card" style={{ padding:24, textAlign:"center", color:"#94a3b8" }}>Set up your profile to see matches</div>
              ) : matched.length === 0 ? (
                <div className="card" style={{ padding:24, textAlign:"center", color:"#94a3b8" }}>No matches yet — try updating your profile</div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  {matched.slice(0, dashboardLimit).map(s => (
                    <div key={s.id} className="card" style={{ padding:"14px 16px", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center" }} onClick={()=>setSelectedScheme(s)}>
                      <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                        <div style={{ color:categoryColors[s.category] || "#4b5563" }}>
                          {getCategoryIcon(s.category, 24)}
                        </div>
                        <div>
                          <div style={{ fontSize:13, fontWeight:600 }}>{s.name}</div>
                          <div style={{ fontSize:12, color:"#94a3b8" }}>{s.benefit}</div>
                        </div>
                      </div>
                      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                        {applications.find(a=>a.id===s.id) && <span style={{ fontSize:11, background:"#f0fdf4", color:"#15803d", padding:"2px 8px", borderRadius:20, fontWeight:500 }}>Applied</span>}
                        <span style={{ color:"#94a3b8", fontSize:16 }}>›</span>
                      </div>
                    </div>
                  ))}
                  {dashboardLimit < matched.length && (
                    <button className="btn-outline" style={{ marginTop: 8 }} onClick={() => setDashboardLimit(prev => prev + 5)}>
                      Load More ({matched.length - dashboardLimit} left)
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Right column */}
            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
              {/* Near misses */}
              <div>
                <h2 style={{ fontSize:18, fontWeight:600, marginBottom:14, display:"flex", alignItems:"center", gap:8 }}>
                  <Zap size={20} color="#d97706" /> Almost Eligible
                </h2>
                {!profileSaved ? (
                  <div className="card" style={{ padding:24, textAlign:"center", color:"#94a3b8" }}>Set up your profile first</div>
                ) : nearMiss.length === 0 ? (
                  <div className="card" style={{ padding:16, textAlign:"center", color:"#94a3b8", fontSize:13 }}>No near-misses found</div>
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    {nearMiss.slice(0,3).map(s=>(
                      <div key={s.id} className="card" style={{ padding:"12px 14px", cursor:"pointer" }} onClick={()=>setSelectedScheme(s)}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                          <span style={{ fontSize:13, fontWeight:600 }}>{s.name}</span>
                          <span style={{ fontSize:12, color:"#d97706", fontWeight:500 }}>{Math.round(getScore(user,s)*100)}%</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width:`${Math.round(getScore(user,s)*100)}%`, background:"#f59e0b" }}/>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Applications */}
              <div>
                <h2 style={{ fontSize:18, fontWeight:600, marginBottom:14, display:"flex", alignItems:"center", gap:8 }}>
                  <FileText size={20} color="#1e8b4e" /> My Applications
                </h2>
                {applications.length === 0 ? (
                  <div className="card" style={{ padding:20, textAlign:"center", color:"#94a3b8", fontSize:13 }}>No applications yet.<br/>Open a scheme and click Apply.</div>
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    {applications.map(a=>(
                      <div key={a.id} className="card" style={{ padding:"12px 14px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <div>
                          <div style={{ fontSize:13, fontWeight:600 }}>{a.name}</div>
                          <div style={{ fontSize:12, color:"#94a3b8", marginTop:2 }}>Applied on {a.appliedOn}</div>
                        </div>
                        <span style={{ fontSize:11, background:"#f0fdf4", color:"#15803d", padding:"3px 10px", borderRadius:20, fontWeight:500 }}>✓ {a.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Saved */}
              <div>
                <h2 style={{ fontSize:18, fontWeight:600, marginBottom:14, display:"flex", alignItems:"center", gap:8 }}>
                  <Bookmark size={20} color="#4f46e5" /> Saved Schemes
                </h2>
                {bookmarks.length === 0 ? (
                  <div className="card" style={{ padding:20, textAlign:"center", color:"#94a3b8", fontSize:13 }}>No saved schemes yet.<br/>Click the bookmark icon on any scheme.</div>
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    {dbSchemes.filter(s=>bookmarks.includes(s.id || s._id)).map(s=>(
                      <div key={s._id || s.id} className="card" style={{ padding:"12px 14px", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center" }} onClick={()=>setSelectedScheme(s)}>
                        <span style={{ fontSize:13, fontWeight:600 }}>{s.name}</span>
                        <button onClick={e=>{e.stopPropagation();toggleBookmark(s.id || s._id);}} style={{ background:"none", border:"none", color:"#94a3b8", cursor:"pointer", fontSize:13 }}>Remove</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── ADMIN PAGE ── */}
      {page === "admin" && (
        <div style={{ maxWidth:1100, margin:"32px auto", padding:"0 24px" }}>
          <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:26, marginBottom:8 }}>Admin · Manage Schemes</h1>
          <p style={{ color:"#64748b", marginBottom:16 }}>Enter the admin secret to view and edit schemes stored in the backend.</p>

          <div className="card" style={{ padding:20, marginBottom:20 }}>
            <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:12 }}>
              <input
                className="input"
                type="password"
                placeholder="Admin secret (x-admin-secret)"
                value={adminSecret}
                onChange={(e)=>setAdminSecret(e.target.value)}
                style={{ maxWidth:260 }}
              />
              <button className="btn-primary" onClick={fetchAdminSchemes} disabled={!adminSecret}>
                {adminLoading ? "Loading..." : "Load schemes"}
              </button>
            </div>
            <div style={{ fontSize:12, color:"#94a3b8" }}>
              The server must have <code>ADMIN_SECRET</code> set in its environment. This is a simple shared secret
              for development; use a stronger auth method in production.
            </div>
          </div>

          <div className="admin-grid" style={{ display:"grid", gridTemplateColumns:"1.1fr 1fr", gap:20 }}>
            {/* List */}
            <div className="card" style={{ padding:18, maxHeight:"70vh", overflowY:"auto" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                <h2 style={{ fontSize:16, fontWeight:600 }}>Existing schemes</h2>
                <span style={{ fontSize:12, color:"#94a3b8" }}>{adminSchemes.length} loaded</span>
              </div>
              {adminSchemes.length === 0 ? (
                <div style={{ fontSize:13, color:"#94a3b8" }}>No schemes loaded. Enter the correct admin secret and click Load schemes.</div>
              ) : (
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                  <thead>
                    <tr style={{ textAlign:"left", borderBottom:"1px solid #e5e7eb" }}>
                      <th style={{ padding:"6px 4px" }}>Name</th>
                      <th style={{ padding:"6px 4px" }}>Category</th>
                      <th style={{ padding:"6px 4px" }}>Active</th>
                      <th style={{ padding:"6px 4px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminSchemes.map((s) => (
                      <tr key={s._id} style={{ borderBottom:"1px solid #f1f5f9" }}>
                        <td style={{ padding:"6px 4px", fontWeight:500 }}>{s.name}</td>
                        <td style={{ padding:"6px 4px" }}>{s.category}</td>
                        <td style={{ padding:"6px 4px" }}>
                          <button
                            className="pill-tab"
                            style={{
                              padding:"2px 10px",
                              fontSize:11,
                              background: s.isActive ? "#dcfce7" : "#fee2e2",
                              borderColor: s.isActive ? "#22c55e" : "#ef4444",
                              color: s.isActive ? "#15803d" : "#b91c1c",
                            }}
                            onClick={() => toggleActive(s._id)}
                          >
                            {s.isActive ? "Active" : "Inactive"}
                          </button>
                        </td>
                        <td style={{ padding:"6px 4px" }}>
                          <button
                            className="btn-outline"
                            style={{ padding:"4px 8px", fontSize:11, marginRight:4 }}
                            onClick={() => startEditScheme(s)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn-outline"
                            style={{ padding:"4px 8px", fontSize:11, borderColor:"#ef4444", color:"#b91c1c" }}
                            onClick={() => deleteScheme(s._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Form */}
            <div className="card" style={{ padding:18 }}>
              <h2 style={{ fontSize:16, fontWeight:600, marginBottom:10 }}>
                {editingScheme ? "Edit scheme" : "Create new scheme"}
              </h2>
              <form onSubmit={saveAdminScheme} style={{ display:"flex", flexDirection:"column", gap:8, fontSize:12 }}>
                <label>
                  Name
                  <input
                    className="input"
                    name="name"
                    defaultValue={editingScheme?.name || ""}
                    required
                    style={{ marginTop:4, fontSize:12 }}
                  />
                </label>
                <label>
                  Description
                  <textarea
                    className="input"
                    name="description"
                    defaultValue={editingScheme?.description || ""}
                    rows={3}
                    style={{ marginTop:4, fontSize:12 }}
                  />
                </label>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  <label>
                    Category
                    <select
                      className="input"
                      name="category"
                      defaultValue={editingScheme?.category || "Other"}
                      style={{ marginTop:4, fontSize:12 }}
                    >
                      <option>Agriculture</option>
                      <option>Education</option>
                      <option>Health</option>
                      <option>Housing</option>
                      <option>Business</option>
                      <option>Welfare</option>
                      <option>Women</option>
                      <option>Other</option>
                    </select>
                  </label>
                  <label>
                    Active
                    <div style={{ marginTop:6 }}>
                      <input
                        type="checkbox"
                        name="isActive"
                        defaultChecked={editingScheme ? editingScheme.isActive : true}
                      />{" "}
                      <span style={{ fontSize:12, color:"#64748b" }}>Visible to users</span>
                    </div>
                  </label>
                </div>
                <label>
                  Source URL
                  <input
                    className="input"
                    name="sourceUrl"
                    defaultValue={editingScheme?.sourceUrl || ""}
                    style={{ marginTop:4, fontSize:12 }}
                  />
                </label>

                <div style={{ borderTop:"1px solid #e5e7eb", margin:"8px 0", paddingTop:6, fontWeight:600, fontSize:12 }}>
                  Eligibility
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
                  <label>
                    Min age
                    <input
                      className="input"
                      name="minAge"
                      type="number"
                      defaultValue={editingScheme?.eligibilityCriteria?.minAge ?? ""}
                      style={{ marginTop:4, fontSize:12 }}
                    />
                  </label>
                  <label>
                    Max age
                    <input
                      className="input"
                      name="maxAge"
                      type="number"
                      defaultValue={editingScheme?.eligibilityCriteria?.maxAge ?? ""}
                      style={{ marginTop:4, fontSize:12 }}
                    />
                  </label>
                  <label>
                    Max income
                    <input
                      className="input"
                      name="maxIncome"
                      type="number"
                      defaultValue={editingScheme?.eligibilityCriteria?.maxIncome ?? ""}
                      style={{ marginTop:4, fontSize:12 }}
                    />
                  </label>
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:8 }}>
                  <label>
                    Gender
                    <select
                      className="input"
                      name="gender"
                      defaultValue={editingScheme?.eligibilityCriteria?.gender || "any"}
                      style={{ marginTop:4, fontSize:12 }}
                    >
                      <option value="any">Any</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </label>
                  <label>
                    States (Hold Ctrl to select multiple)
                    <select
                      multiple
                      className="input"
                      name="states"
                      defaultValue={editingScheme?.eligibilityCriteria?.states || []}
                      style={{ marginTop:4, fontSize:12, height:60 }}
                    >
                      {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </label>
                </div>
                <label>
                  Caste categories (Hold Ctrl to select multiple)
                  <select
                    multiple
                    className="input"
                    name="casteCategory"
                    defaultValue={editingScheme?.eligibilityCriteria?.casteCategory || []}
                    style={{ marginTop:4, fontSize:12, height:60 }}
                  >
                    <option value="general">General</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                  </select>
                </label>
                <label>
                  Occupations (Hold Ctrl to select multiple)
                  <select
                    multiple
                    className="input"
                    name="occupation"
                    defaultValue={editingScheme?.eligibilityCriteria?.occupation || []}
                    style={{ marginTop:4, fontSize:12, height:60 }}
                  >
                    <option value="farmer">Farmer</option>
                    <option value="student">Student</option>
                    <option value="salaried">Salaried</option>
                    <option value="business">Business</option>
                    <option value="self-employed">Self-Employed</option>
                    <option value="unemployed">Unemployed</option>
                  </select>
                </label>



                <div style={{ display:"flex", justifyContent:"space-between", marginTop:10 }}>
                  <button type="submit" className="btn-primary" disabled={!adminSecret}>
                    {editingScheme ? "Save changes" : "Create scheme"}
                  </button>
                  {editingScheme && (
                    <button
                      type="button"
                      className="btn-outline"
                      onClick={() => setEditingScheme(null)}
                    >
                      Cancel edit
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ borderTop:"1px solid #e8ecf4", marginTop:60, padding:"24px", textAlign:"center", color:"#94a3b8", fontSize:13 }}>
        <span style={{ fontFamily:"'Fraunces',serif", fontWeight:600, color:"#64748b" }}>YojanaTrack</span> — Built with MERN Stack · Not affiliated with the Government of India
      </footer>
    </div>
  );
}
