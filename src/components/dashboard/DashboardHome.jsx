import React, { useEffect, useState } from "react";
import {
  Banknote,
  CheckCircle,
  Circle,
  Download,
  FileCheck,
  Globe,
  Package,
  PlusCircle,
  ReceiptText,
  UserPlus,
  Users,
  WalletCards,
} from "lucide-react";
import { LIME, DARK } from "../../constants";
import { supabase } from "../../lib/supabase";

const GREEN = "#ea4c89";

function SoftIcon({ icon: Icon, color = GREEN, bg = "#fde8f1", size = 20 }) {
  return (
    <span style={{ width:"42px", height:"42px", borderRadius:"50%", background:bg, display:"inline-flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <Icon size={size} strokeWidth={2.2} color={color} />
    </span>
  );
}

function QuickAction({ icon: Icon, label, onClick, accent = GREEN }) {
  const showPlus = label.startsWith("Add ");
  return (
    <button onClick={onClick}
      style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"8px", background:"transparent", border:"none", cursor:"pointer", minWidth:"86px", padding:"4px" }}>
      <span style={{ width:"58px", height:"58px", borderRadius:"50%", background:"#fde8f1", display:"flex", alignItems:"center", justifyContent:"center", color:accent, position:"relative" }}>
        <Icon size={25} strokeWidth={2.2} color={accent} />
        {showPlus && (
          <span style={{ position:"absolute", right:"4px", bottom:"4px", width:"20px", height:"20px", borderRadius:"50%", background:"#fff", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 12px rgba(32,32,33,0.12)" }}>
            <PlusCircle size={16} strokeWidth={2.4} color={accent} />
          </span>
        )}
      </span>
      <span style={{ fontSize:"11px", fontWeight:700, color:DARK, lineHeight:1.25, textAlign:"center" }}>{label}</span>
    </button>
  );
}

export function DashboardHome({ user, business, setTab }) {
  const [data, setData]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [celebration, setCelebration] = useState(null);

  const today = new Date().toISOString().slice(0, 10);

  function greeting() {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  }

  useEffect(() => {
    if (!business?.id) { setLoading(false); return; }

    async function loadAll() {
      const [{ data: customers }, { data: bookings }, { data: payments }] = await Promise.all([
        supabase.from("customers").select("*").eq("business_id", business.id),
        supabase.from("bookings").select("*").eq("business_id", business.id),
        supabase.from("payments").select("*").eq("business_id", business.id),
      ]);

      const now            = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 10);
      const lastMonthEnd   = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().slice(0, 10);
      const thirtyDaysAgo  = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
      const sevenDaysAgo   = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
      const threeDaysAhead = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);

      const totalCustomers = customers?.length || 0;
      const leads          = customers?.filter((c) => c.status === "lead") || [];
      const todayBookings  = bookings?.filter((b) => b.booking_date === today && b.status === "confirmed") || [];
      const upcomingSoon   = bookings?.filter((b) => b.booking_date > today && b.booking_date <= threeDaysAhead && b.status === "confirmed") || [];
      const doneBookings   = bookings?.filter((b) => b.status === "done") || [];
      const revenuePayments = (payments || []).filter((p) => p.status === "Paid" || p.status === "Deposit paid");
      const unpaidPayments  = (payments || []).filter((p) => p.status === "Unpaid");
      const customerById    = Object.fromEntries((customers || []).map((c) => [c.id, c]));

      const thisMonthRevenue = revenuePayments
        .filter((p) => (p.created_at || "").slice(0, 10) >= thisMonthStart)
        .reduce((s, p) => s + (p.amount || 0), 0);

      const lastMonthRevenue = revenuePayments
        .filter((p) => {
          const d = (p.created_at || "").slice(0, 10);
          return d >= lastMonthStart && d <= lastMonthEnd;
        })
        .reduce((s, p) => s + (p.amount || 0), 0);

      const totalEarned = revenuePayments.reduce((s, p) => s + (p.amount || 0), 0);

      const needsContact = (customers || []).filter((c) => {
        if (c.status === "lead") return false;
        if (!c.last_contacted) return (c.visit_count || 0) > 0;
        return c.last_contacted < thirtyDaysAgo;
      });

      const atRisk = (customers || []).filter((c) => {
        if (c.status === "lead" || c.status === "new") return false;
        const cb = doneBookings
          .filter((b) => b.customer_id === c.id)
          .sort((a, b) => a.booking_date.localeCompare(b.booking_date));
        if (cb.length < 2) return false;
        let totalGap = 0;
        for (let i = 1; i < cb.length; i++) {
          totalGap += (new Date(cb[i].booking_date) - new Date(cb[i-1].booking_date)) / 86400000;
        }
        const avgGap = totalGap / (cb.length - 1);
        const daysSinceLast = (Date.now() - new Date(cb[cb.length-1].booking_date).getTime()) / 86400000;
        return daysSinceLast > avgGap + 7;
      });

      const followUpNudges = doneBookings.filter((b) => {
        const doneDate = (b.updated_at || b.booking_date || "").slice(0, 10);
        return doneDate >= sevenDaysAgo && doneDate <= today;
      }).slice(0, 3);

      const serviceCounts = {};
      (bookings || []).forEach((b) => {
        if (!b.service) return;
        b.service.split(",").map((s) => s.trim()).forEach((s) => {
          if (s) serviceCounts[s] = (serviceCounts[s] || 0) + 1;
        });
      });
      const topService = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1])[0] || null;

      const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (5 - i));
        const ym = d.toISOString().slice(0, 7);
        const val = revenuePayments
          .filter((p) => p.created_at?.startsWith(ym))
          .reduce((s, p) => s + (p.amount || 0), 0);
        return { label: d.toLocaleDateString("en-ZA", { month: "short" }), value: val };
      });

      // ── MILESTONE CELEBRATIONS ──
      const celebrationKey = `vula_celebrated_${business.id}_${(customers||[])[0]?.business_id || business.id}`;
      const celebrated = JSON.parse(localStorage.getItem(celebrationKey) || "{}");
      let newCelebration = null;

      const lastSale = revenuePayments
        .sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""))[0];

      if (totalCustomers >= 50 && !celebrated.fifty_customers)
        newCelebration = { key:"fifty_customers", title:"50 customers", msg:`${business.name} now has 50 customers. That is a real, growing business.` };
      else if (totalEarned >= 1000 && !celebrated.first_1000)
        newCelebration = { key:"first_1000", title:"R1,000 earned", msg:"Four figures. You have built something that pays. Keep going." };
      else if (totalCustomers >= 10 && !celebrated.ten_customers)
        newCelebration = { key:"ten_customers", title:"10 customers", msg:"Ten people have trusted you with their money. Time to turn your best ones into VIPs." };
      else if (lastSale && !celebrated[`sale_${lastSale.id}`])
        newCelebration = { key:`sale_${lastSale.id}`, title:`R${lastSale.amount} earned`, msg:`${customerById[lastSale.customer_id]?.name || "A customer"} paid. Well done — every sale counts.` };
      else if (doneBookings.length >= 1 && !celebrated.first_booking)
        newCelebration = { key:"first_booking", title:"First booking completed", msg:"You showed up and delivered. That is what it takes." };
      else if (totalCustomers >= 1 && !celebrated.first_customer)
        newCelebration = { key:"first_customer", title:"First customer added", msg:"Every big business started with one. You have yours." };

      // ── SMART BANNER ──
      let liveBanner = null;
      if (!newCelebration) {
        if (todayBookings.length > 0) {
          const names = todayBookings.map((b) => b.customer_name.split(" ")[0]).join(", ");
          liveBanner = { title:`${todayBookings.length} appointment${todayBookings.length !== 1 ? "s" : ""} today`, msg:`${names} ${todayBookings.length === 1 ? "is" : "are"} booked in. You are ready.` };
        } else if (upcomingSoon.length > 0) {
          const next = upcomingSoon[0];
          liveBanner = { title:"Next up", msg:`${next.customer_name} — ${next.service || "appointment"} on ${new Date(next.booking_date + "T00:00:00").toLocaleDateString("en-ZA", { weekday:"short", day:"numeric", month:"short" })}${next.booking_time ? " at " + next.booking_time : ""}` };
        } else if (atRisk.length > 0) {
          liveBanner = { title:"Heads up", msg:`${atRisk[0].name} usually books more regularly. A quick message could bring them back.` };
        } else if (leads.length > 0) {
          liveBanner = { title:`${leads.length} lead${leads.length !== 1 ? "s" : ""} waiting`, msg:`${leads.slice(0,2).map((c) => c.name.split(" ")[0]).join(", ")} ${leads.length === 1 ? "has" : "have"} not booked yet. Follow up today.` };
        } else if (thisMonthRevenue > 0 && lastMonthRevenue > 0) {
          const diff = thisMonthRevenue - lastMonthRevenue;
          liveBanner = diff >= 0
            ? { title:"Revenue up this month", msg:`R${thisMonthRevenue.toLocaleString()} earned so far — R${Math.abs(diff).toLocaleString()} more than last month.` }
            : { title:"Revenue this month", msg:`R${thisMonthRevenue.toLocaleString()} earned so far. Last month was R${lastMonthRevenue.toLocaleString()}.` };
        }
      }

      setData({
        totalCustomers, leads, todayBookings, upcomingSoon,
        needsContact, atRisk, followUpNudges, topService,
        thisMonthRevenue, lastMonthRevenue, monthlyRevenue, unpaidPayments,
        doneBookings, totalEarned, liveBanner,
      });

      if (newCelebration) setCelebration({ ...newCelebration, celebrationKey });
      setLoading(false);
    }
    loadAll();
  }, [business?.id]);

  function dismissCelebration() {
    if (!celebration) return;
    const existing = JSON.parse(localStorage.getItem(celebration.celebrationKey) || "{}");
    existing[celebration.key] = true;
    localStorage.setItem(celebration.celebrationKey, JSON.stringify(existing));
    setCelebration(null);
  }

  if (!business?.name) return (
    <div>
      <h2 style={{ fontSize:"22px", fontWeight:800, color:DARK, marginBottom:"6px" }}>Welcome to VulaTrade</h2>
      <p style={{ fontSize:"14px", color:"#888", marginBottom:"28px" }}>{user.email}</p>
      <div style={{ background:DARK, borderRadius:"20px", padding:"28px", marginBottom:"20px" }}>
        <div style={{ fontSize:"20px", fontWeight:800, color:LIME, marginBottom:"8px" }}>Let's build your business page</div>
        <div style={{ fontSize:"14px", color:"rgba(255,255,255,0.6)", marginBottom:"20px", lineHeight:1.6 }}>
          Pick a template and launch in minutes. Your customers will be able to find you, book you, and pay you.
        </div>
        <button onClick={() => setTab("Templates")}
          style={{ backgroundColor:LIME, color:"#fff", border:"none", borderRadius:"12px", padding:"12px 24px", fontSize:"14px", fontWeight:800, cursor:"pointer" }}>
          Browse templates
        </button>
      </div>
    </div>
  );

  const revenueUp = (data?.thisMonthRevenue || 0) >= (data?.lastMonthRevenue || 0);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"20px" }}>

      {/* Banner */}
      {(celebration || data?.liveBanner) && (
        <div style={{ background:DARK, borderRadius:"20px", padding:"20px 24px", display:"flex", alignItems:"center", gap:"16px" }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.4)", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"6px" }}>
              {celebration ? "Milestone" : "Right now"}
            </div>
            <div style={{ fontSize:"16px", fontWeight:800, color:LIME, marginBottom:"4px" }}>
              {celebration ? celebration.title : data?.liveBanner?.title}
            </div>
            <div style={{ fontSize:"13px", color:"rgba(255,255,255,0.65)", lineHeight:1.5 }}>
              {celebration ? celebration.msg : data?.liveBanner?.msg}
            </div>
          </div>
          {celebration && (
            <button onClick={dismissCelebration}
              style={{ background:"transparent", border:"none", color:"rgba(255,255,255,0.3)", fontSize:"20px", cursor:"pointer", flexShrink:0, padding:"4px 8px", lineHeight:1 }}>
              ×
            </button>
          )}
        </div>
      )}

      {/* Header */}
      <div>
        <h2 style={{ fontSize:"22px", fontWeight:800, color:DARK, marginBottom:"2px" }}>
          {greeting()}{business?.owner ? `, ${business.owner.split(" ")[0]}` : business?.name ? `, ${business.name.split(" ")[0]}` : ""}
        </h2>
        <p style={{ fontSize:"13px", color:"#aaa" }}>
          {new Date().toLocaleDateString("en-ZA", { weekday:"long", day:"numeric", month:"long" })}
        </p>
      </div>

      {loading || !data ? (
        <div style={{ textAlign:"center", padding:"40px", color:"#aaa" }}>Loading your dashboard…</div>
      ) : (
        <>
          {/* Stat cards */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(140px, 1fr))", gap:"10px" }}>
            {[
              { label:"Total Sales", value:`R${data.thisMonthRevenue.toLocaleString()}`, sub:data.lastMonthRevenue>0?`${revenueUp?"▲":"▼"} vs R${data.lastMonthRevenue.toLocaleString()} last month`:"Log payments to track", subColor:data.lastMonthRevenue>0?(revenueUp?"#d93f7b":"#cc3300"):"#bbb", onClick:()=>setTab("Money"), icon:Banknote },
              { label:"Products / Services", value:data.todayBookings.length, sub:data.todayBookings.length===0?"No sales today":`${data.todayBookings.length} appointment${data.todayBookings.length!==1?"s":""} today`, onClick:()=>setTab("Setup"), highlight:data.todayBookings.length>0, icon:Package, bg:"#edf5fe", color:"#0267ff" },
              { label:"Customers", value:data.totalCustomers, sub:data.leads.length>0?`${data.leads.length} lead${data.leads.length!==1?"s":""} to convert`:"No leads waiting", onClick:()=>setTab("Customers"), icon:Users, bg:"#fff8e7", color:"#d89b00" },
              { label:"Business File Progress", value:data.needsContact.length+data.atRisk.length+data.unpaidPayments.length === 0 ? "Ready" : data.needsContact.length+data.atRisk.length+data.unpaidPayments.length, sub:data.unpaidPayments.length>0?`${data.unpaidPayments.length} unpaid payment${data.unpaidPayments.length!==1?"s":""}`:data.needsContact.length+data.atRisk.length>0?"Actions to complete":"All caught up", subColor:data.needsContact.length+data.atRisk.length+data.unpaidPayments.length>0?"#f59e0b":"#d93f7b", onClick:()=>data.unpaidPayments.length>0?setTab("Money"):setTab("Customers"), icon:FileCheck, bg:"#fbe6ea", color:"#d90429" },
            ].map((s) => (
              <div key={s.label} onClick={s.onClick}
                style={{ background:"#fff", border:`1.5px solid ${s.highlight ? LIME : "#eeeeea"}`, borderRadius:"16px", padding:"18px", cursor:s.onClick?"pointer":"default" }}
                onMouseEnter={(e) => { if (s.onClick) e.currentTarget.style.borderColor = DARK; }}
                onMouseLeave={(e) => { if (s.onClick) e.currentTarget.style.borderColor = s.highlight ? LIME : "#eeeeea"; }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:"12px", marginBottom:"12px" }}>
                  <div style={{ fontSize:"10px", color:"#aaa", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em" }}>{s.label}</div>
                  <SoftIcon icon={s.icon} bg={s.bg || "#fde8f1"} color={s.color || GREEN} size={19} />
                </div>
                <div style={{ fontSize:"28px", fontWeight:900, color:DARK, lineHeight:1, marginBottom:"6px" }}>{s.value}</div>
                <div style={{ fontSize:"11px", color:s.subColor||"#bbb", fontWeight:600 }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Quick actions */}
          <div style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"20px", padding:"20px" }}>
            <div style={{ fontSize:"15px", fontWeight:800, color:DARK, marginBottom:"16px" }}>Quick actions</div>
            <div style={{ display:"flex", gap:"14px", overflowX:"auto", paddingBottom:"2px" }}>
              <QuickAction icon={ReceiptText} label="Add Sale" onClick={() => setTab("Money")} />
              <QuickAction icon={Package} label="Add Product / Service" onClick={() => setTab("Setup")} accent="#0267ff" />
              <QuickAction icon={UserPlus} label="Add Customer" onClick={() => setTab("Customers")} accent="#d89b00" />
              <QuickAction icon={WalletCards} label="Add Expense" onClick={() => setTab("Money")} accent="#d93f7b" />
              <QuickAction icon={Globe} label="View Public Page" onClick={() => setTab("Page")} accent="#ea4c89" />
              <QuickAction icon={Download} label="Download Business File" onClick={() => setTab("Growth")} accent="#767b81" />
            </div>
          </div>

          {/* Business file checklist */}
          <div style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"20px", padding:"20px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"16px" }}>
              <SoftIcon icon={FileCheck} />
              <div>
                <div style={{ fontSize:"15px", fontWeight:800, color:DARK }}>Business File checklist</div>
                <div style={{ fontSize:"12px", color:"#888", marginTop:"2px" }}>Small records that make your business easier to prove.</div>
              </div>
            </div>
            <div style={{ display:"grid", gap:"10px" }}>
              {[
                { label:"Business profile created", done:Boolean(business?.name) },
                { label:"Public page ready", done:Boolean(business?.slug) },
                { label:"Customers added", done:data.totalCustomers > 0 },
                { label:"Sales recorded", done:data.totalEarned > 0 },
              ].map((item) => {
                const Icon = item.done ? CheckCircle : Circle;
                return (
                  <div key={item.label} style={{ display:"flex", alignItems:"center", gap:"10px", fontSize:"13px", fontWeight:700, color:item.done?DARK:"#888" }}>
                    <Icon size={19} strokeWidth={2.2} color={item.done ? GREEN : "#c6cbd1"} />
                    {item.label}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Today's appointments */}
          <div style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"20px", padding:"20px" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"16px" }}>
              <div style={{ fontSize:"15px", fontWeight:800, color:DARK }}>Today's appointments</div>
              <button onClick={() => setTab("Bookings")} style={{ fontSize:"12px", color:"#aaa", background:"transparent", border:"none", cursor:"pointer", fontWeight:600 }}>View all</button>
            </div>
            {data.todayBookings.length === 0 ? (
              <div style={{ background:"#fbfbfb", borderRadius:"14px", padding:"20px", textAlign:"center" }}>
                <div style={{ fontSize:"13px", color:"#888", marginBottom:"14px", lineHeight:1.6 }}>
                  No appointments today — a good time to reach out to customers or plan ahead.
                </div>
                <div style={{ display:"flex", gap:"8px", justifyContent:"center", flexWrap:"wrap" }}>
                  <button onClick={() => setTab("Customers")} style={{ padding:"8px 16px", borderRadius:"10px", border:"none", background:DARK, color:LIME, fontSize:"12px", fontWeight:700, cursor:"pointer" }}>Follow up with customers</button>
                  <button onClick={() => setTab("Bookings")} style={{ padding:"8px 16px", borderRadius:"10px", border:"1.5px solid #e0e0e0", background:"#fff", color:"#555", fontSize:"12px", fontWeight:700, cursor:"pointer" }}>Add a booking</button>
                </div>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                {data.todayBookings
                  .sort((a, b) => (a.booking_time || "").localeCompare(b.booking_time || ""))
                  .map((b) => (
                    <div key={b.id} style={{ display:"flex", alignItems:"center", gap:"14px", padding:"12px 16px", background:"#fbfbfb", borderRadius:"12px" }}>
                      <div style={{ textAlign:"center", minWidth:"44px", background:LIME, borderRadius:"10px", padding:"6px 0" }}>
                        <div style={{ fontSize:"13px", fontWeight:900, color:DARK }}>{b.booking_time || "—"}</div>
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:"14px", fontWeight:700, color:DARK }}>{b.customer_name}</div>
                        {b.service && <div style={{ fontSize:"12px", color:"#aaa" }}>{b.service}</div>}
                      </div>
                      {b.price > 0 && <div style={{ fontSize:"14px", fontWeight:800, color:DARK }}>R{b.price}</div>}
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Upcoming 3 days */}
          {data.upcomingSoon.length > 0 && (
            <div style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"20px", padding:"20px" }}>
              <div style={{ fontSize:"15px", fontWeight:800, color:DARK, marginBottom:"14px" }}>Coming up this week</div>
              <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
                {data.upcomingSoon.slice(0, 4).map((b) => (
                  <div key={b.id} style={{ display:"flex", alignItems:"center", gap:"12px", padding:"10px 14px", border:"1px solid #eeeeea", borderRadius:"12px" }}>
                    <div style={{ textAlign:"center", minWidth:"36px" }}>
                      <div style={{ fontSize:"16px", fontWeight:900, color:DARK }}>{new Date(b.booking_date + "T00:00:00").getDate()}</div>
                      <div style={{ fontSize:"10px", color:"#aaa", fontWeight:600 }}>{new Date(b.booking_date + "T00:00:00").toLocaleDateString("en-ZA", { month:"short" })}</div>
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:"13px", fontWeight:700, color:DARK }}>{b.customer_name}</div>
                      {b.service && <div style={{ fontSize:"12px", color:"#aaa" }}>{b.service}</div>}
                    </div>
                    {b.booking_time && <div style={{ fontSize:"12px", fontWeight:700, color:"#888" }}>{b.booking_time}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Needs attention */}
          <div style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"20px", padding:"20px" }}>
            <div style={{ fontSize:"15px", fontWeight:800, color:DARK, marginBottom:"16px" }}>Needs your attention</div>
            <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
              {data.totalCustomers === 0 ? (
                <>
                  {[
                    { n:1, title:"Add your first customers", sub:"Import from your phone contacts or add manually", btn:"Add customers", tab:"Customers", primary:true },
                    { n:2, title:"Share your business page", sub:"Send your link on WhatsApp so customers can find you", btn:"View page", tab:"Page", primary:false },
                    { n:3, title:"Book your first appointment", sub:"Add a booking and start tracking your schedule", btn:"Add booking", tab:"Bookings", primary:false },
                  ].map((step) => (
                    <div key={step.n} style={{ background:"#fbfbfb", borderRadius:"14px", padding:"16px", display:"flex", alignItems:"center", gap:"14px" }}>
                      <div style={{ width:"40px", height:"40px", borderRadius:"12px", background:step.primary?LIME:"#d4d7db", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, color:DARK, flexShrink:0, fontSize:"16px" }}>{step.n}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:"13px", fontWeight:700, color:DARK, marginBottom:"2px" }}>{step.title}</div>
                        <div style={{ fontSize:"12px", color:"#aaa" }}>{step.sub}</div>
                      </div>
                      <button onClick={() => setTab(step.tab)}
                        style={{ padding:"8px 14px", borderRadius:"10px", border:step.primary?"none":"1.5px solid #e0e0e0", background:step.primary?DARK:"#fff", color:step.primary?LIME:"#555", fontSize:"12px", fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>
                        {step.btn}
                      </button>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  {data.unpaidPayments.length > 0 && (
                    <div style={{ background:"#fff8ee", border:"1px solid #f0d080", borderRadius:"14px", padding:"16px", display:"flex", alignItems:"center", gap:"14px" }}>
                      <div style={{ width:"40px", height:"40px", borderRadius:"12px", background:"#f0d000", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, color:DARK, flexShrink:0, fontSize:"13px" }}>R</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:"13px", fontWeight:700, color:DARK, marginBottom:"2px" }}>
                          {data.unpaidPayments.length} unpaid payment{data.unpaidPayments.length!==1?"s":""} to follow up
                        </div>
                        <div style={{ fontSize:"12px", color:"#9a7a00" }}>Check Money before closing out today.</div>
                      </div>
                      <button onClick={() => setTab("Money")}
                        style={{ padding:"8px 14px", borderRadius:"10px", border:"none", background:DARK, color:LIME, fontSize:"12px", fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>
                        View payments
                      </button>
                    </div>
                  )}
                  {data.followUpNudges.length > 0 && (
                    <div style={{ background:"#fbfbfb", borderRadius:"14px", padding:"16px", display:"flex", alignItems:"center", gap:"14px" }}>
                      <div style={{ width:"40px", height:"40px", borderRadius:"12px", background:LIME, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, color:DARK, flexShrink:0, fontSize:"13px" }}>TY</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:"13px", fontWeight:700, color:DARK, marginBottom:"2px" }}>
                          Send a thank-you to {data.followUpNudges.map((b) => b.customer_name.split(" ")[0]).join(", ")}
                        </div>
                        <div style={{ fontSize:"12px", color:"#aaa" }}>Recently completed — a quick message keeps them coming back</div>
                      </div>
                      <button onClick={() => setTab("Customers")}
                        style={{ padding:"8px 14px", borderRadius:"10px", border:"none", background:DARK, color:LIME, fontSize:"12px", fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>
                        Message them
                      </button>
                    </div>
                  )}
                  {data.atRisk.length > 0 && (
                    <div style={{ background:"#fff8ee", border:"1px solid #f0d080", borderRadius:"14px", padding:"16px", display:"flex", alignItems:"center", gap:"14px" }}>
                      <div style={{ width:"40px", height:"40px", borderRadius:"12px", background:"#f0d000", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, color:DARK, flexShrink:0, fontSize:"13px" }}>!</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:"13px", fontWeight:700, color:DARK, marginBottom:"2px" }}>
                          {data.atRisk.map((c) => c.name.split(" ")[0]).slice(0,2).join(", ")}{data.atRisk.length > 2 ? ` +${data.atRisk.length-2} more` : ""} {data.atRisk.length === 1 ? "is" : "are"} overdue
                        </div>
                        <div style={{ fontSize:"12px", color:"#9a7a00" }}>
                          {data.atRisk.length === 1 ? "This regular" : "These regulars"} usually book more frequently — reach out before they drift away
                        </div>
                      </div>
                      <button onClick={() => setTab("Customers")}
                        style={{ padding:"8px 14px", borderRadius:"10px", border:"none", background:DARK, color:LIME, fontSize:"12px", fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>
                        Reach out
                      </button>
                    </div>
                  )}
                  {data.leads.length > 0 && (
                    <div style={{ background:"#fbfbfb", borderRadius:"14px", padding:"16px", display:"flex", alignItems:"center", gap:"14px" }}>
                      <div style={{ width:"40px", height:"40px", borderRadius:"12px", background:"#d4d7db", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, color:DARK, flexShrink:0, fontSize:"13px" }}>→</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:"13px", fontWeight:700, color:DARK, marginBottom:"2px" }}>
                          {data.leads.length} lead{data.leads.length!==1?"s":""} {data.leads.length===1?"has":"have"} not booked yet
                        </div>
                        <div style={{ fontSize:"12px", color:"#aaa" }}>
                          {data.leads.slice(0, 2).map((c) => c.name).join(", ")}{data.leads.length > 2 ? ` +${data.leads.length - 2} more` : ""}
                        </div>
                      </div>
                      <button onClick={() => setTab("Customers")}
                        style={{ padding:"8px 14px", borderRadius:"10px", border:"none", background:DARK, color:LIME, fontSize:"12px", fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>
                        Follow up
                      </button>
                    </div>
                  )}
                  {data.needsContact.length > 0 && (
                    <div style={{ background:"#fbfbfb", borderRadius:"14px", padding:"16px", display:"flex", alignItems:"center", gap:"14px" }}>
                      <div style={{ width:"40px", height:"40px", borderRadius:"12px", background:"#d4d7db", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, color:DARK, flexShrink:0, fontSize:"13px" }}>30</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:"13px", fontWeight:700, color:DARK, marginBottom:"2px" }}>
                          {data.needsContact.length} customer{data.needsContact.length!==1?"s":""} not contacted in 30+ days
                        </div>
                        <div style={{ fontSize:"12px", color:"#aaa" }}>
                          {data.needsContact.slice(0, 2).map((c) => c.name).join(", ")}{data.needsContact.length > 2 ? ` +${data.needsContact.length - 2} more` : ""}
                        </div>
                      </div>
                      <button onClick={() => setTab("Customers")}
                        style={{ padding:"8px 14px", borderRadius:"10px", border:"none", background:DARK, color:LIME, fontSize:"12px", fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>
                        Reach out
                      </button>
                    </div>
                  )}
                  {data.unpaidPayments.length === 0 && data.followUpNudges.length === 0 && data.atRisk.length === 0 && data.leads.length === 0 && data.needsContact.length === 0 && (
                    <div style={{ background:"#fff5f9", border:"1px solid #f8b8d2", borderRadius:"14px", padding:"16px", display:"flex", alignItems:"center", gap:"12px" }}>
                      <div style={{ width:"40px", height:"40px", borderRadius:"12px", background:LIME, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, color:DARK, flexShrink:0, fontSize:"13px" }}>✓</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:"13px", color:"#d93f7b", fontWeight:700 }}>You are all caught up</div>
                        <div style={{ fontSize:"12px", color:"#d93f7b", marginTop:"2px" }}>Share your page on WhatsApp to keep new customers coming in</div>
                      </div>
                      <button onClick={() => setTab("Page")}
                        style={{ padding:"6px 12px", borderRadius:"8px", border:"none", background:"#d93f7b", color:"#fff", fontSize:"11px", fontWeight:700, cursor:"pointer", whiteSpace:"nowrap" }}>
                        Share page
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Most popular service */}
          {data.topService && (
            <div style={{ background:DARK, borderRadius:"20px", padding:"20px 24px" }}>
              <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.4)", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:"8px" }}>Most popular service</div>
              <div style={{ fontSize:"20px", fontWeight:800, color:LIME, marginBottom:"4px" }}>{data.topService[0]}</div>
              <div style={{ fontSize:"13px", color:"rgba(255,255,255,0.5)" }}>
                Booked {data.topService[1]} time{data.topService[1] !== 1 ? "s" : ""}
                {data.totalEarned > 0 ? ` · R${data.totalEarned.toLocaleString()} total earned` : ""}
              </div>
            </div>
          )}

          {/* Revenue trend */}
          {data.monthlyRevenue.some((m) => m.value > 0) ? (
            <div style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"20px", padding:"20px" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"16px" }}>
                <div style={{ fontSize:"15px", fontWeight:800, color:DARK }}>Revenue — last 6 months</div>
                <div style={{ fontSize:"13px", fontWeight:700, color: revenueUp ? "#d93f7b" : "#cc3300" }}>
                  {revenueUp ? "▲" : "▼"} {data.lastMonthRevenue > 0
                    ? `${Math.abs(Math.round(((data.thisMonthRevenue - data.lastMonthRevenue) / data.lastMonthRevenue) * 100))}% vs last month`
                    : "First month"}
                </div>
              </div>
              {(() => {
                const max = Math.max(...data.monthlyRevenue.map((m) => m.value), 1);
                return (
                  <div style={{ display:"flex", alignItems:"flex-end", gap:"8px", height:"80px" }}>
                    {data.monthlyRevenue.map((m, i) => {
                      const isLast = i === data.monthlyRevenue.length - 1;
                      const h = Math.max((m.value / max) * 72, m.value > 0 ? 6 : 2);
                      return (
                        <div key={m.label} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:"6px" }}>
                          <div style={{ fontSize:"10px", color:"#888", fontWeight:700 }}>
                            {m.value > 0 ? `R${m.value >= 1000 ? Math.round(m.value/1000)+"k" : m.value}` : ""}
                          </div>
                          <div style={{ width:"100%", height:`${h}px`, borderRadius:"6px 6px 0 0", background: isLast ? LIME : "#d4d7db" }} />
                          <div style={{ fontSize:"10px", color: isLast ? DARK : "#bbb", fontWeight: isLast ? 800 : 500 }}>{m.label}</div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          ) : (
            <div style={{ background:"#fff", border:"1px solid #eeeeea", borderRadius:"20px", padding:"20px" }}>
              <div style={{ fontSize:"15px", fontWeight:800, color:DARK, marginBottom:"12px" }}>Revenue trend</div>
              <div style={{ background:"#fbfbfb", borderRadius:"14px", padding:"20px", textAlign:"center" }}>
                <div style={{ fontSize:"13px", color:"#888", marginBottom:"14px", lineHeight:1.6 }}>
                  No revenue logged yet. Log payments to start tracking.
                </div>
                <div style={{ display:"flex", gap:"8px", justifyContent:"center", flexWrap:"wrap" }}>
                  <button onClick={() => setTab("Money")} style={{ padding:"8px 16px", borderRadius:"10px", border:"none", background:DARK, color:LIME, fontSize:"12px", fontWeight:700, cursor:"pointer" }}>Go to Money</button>
                  <button onClick={() => setTab("Customers")} style={{ padding:"8px 16px", borderRadius:"10px", border:"1.5px solid #e0e0e0", background:"#fff", color:"#555", fontSize:"12px", fontWeight:700, cursor:"pointer" }}>Log from customer</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
