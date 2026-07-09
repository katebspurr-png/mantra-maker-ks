/* ═══════════════════════════════════════════════
   Resonance — "Breath" Full App
   Radical whitespace · Cormorant Garamond · Sage
   ═══════════════════════════════════════════════ */

const B = {
  bg:       "#FDFCF9",
  bgWarm:   "#F5EFE6",
  bgCard:   "#FFFFFF",
  bgDim:    "#F0EBE2",
  text:     "#1C1A16",
  textSoft: "#6E6759",
  textMuted:"#857B6D",
  accent:   "#4A6741",
  accentSoft:"rgba(74,103,65,0.1)",
  accentFg: "#fff",
  warm:     "#C07A52",
  warmSoft: "rgba(192,122,82,0.1)",
  border:   "#E8E2D9",
  serif:    "'Cormorant Garamond', serif",
  sans:     "'Plus Jakarta Sans', sans-serif",
  r: 14, rLg: 20,
};

/* ── Micro icons ── */
const Icon = {
  Play: ({s=18,c="#fff"})=><svg width={s} height={s} viewBox="0 0 24 24" fill={c}><path d="M8 5.14v13.72a1 1 0 001.5.86l11-6.86a1 1 0 000-1.72l-11-6.86a1 1 0 00-1.5.86z"/></svg>,
  Pause:({s=18,c="#fff"})=><svg width={s} height={s} viewBox="0 0 24 24" fill={c}><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>,
  Mic: ({s=18,c=B.text})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>,
  Heart:({s=18,filled=false,c=B.textMuted})=><svg width={s} height={s} viewBox="0 0 24 24" fill={filled?c:"none"} stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
  Search:({s=16,c=B.textMuted})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  More: ({s=16,c=B.textMuted})=><svg width={s} height={s} viewBox="0 0 24 24" fill={c}><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>,
  Refresh:({s=14,c=B.textMuted})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>,
  Back: ({s=20,c=B.textSoft})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  Check:({s=16,c=B.accent})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Plus: ({s=16,c=B.textSoft})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Repeat:({s=18,c=B.textSoft})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>,
  Volume:({s=18,c=B.textSoft})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 010 7.07"/></svg>,
  ChevRight:({s=14,c=B.textMuted})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  ChevDown:({s=16,c=B.textMuted})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
  Redo: ({s=16,c=B.textSoft})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>,
  Trash:({s=16,c=B.textMuted})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
  Bell: ({s=18,c=B.textSoft})=><svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
};

/* ── Shared nav ── */
const Nav = ({ active }) => (
  <div style={{ position:"absolute", bottom:0, left:0, right:0, height:92,
    background:`${B.bg}f2`, backdropFilter:"blur(16px)", borderTop:`0.5px solid ${B.border}`,
    display:"flex", alignItems:"center", justifyContent:"space-around", paddingBottom:18 }}>
    {[
      {id:"home",   label:"Home",     d:"M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10"},
      {id:"library",label:"Library",  d:"M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"},
      {id:"record", label:"Record", isCTA:true},
      {id:"profile",label:"Profile",  d:"M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 3a4 4 0 100 8 4 4 0 000-8z"},
    ].map((item,i) => {
      if (item.isCTA) return (
        <div key="rec" style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
          <div style={{width:46,height:46,borderRadius:14,background:B.text,marginTop:-14,
            display:"flex",alignItems:"center",justifyContent:"center",
            boxShadow:`0 4px 14px rgba(28,26,22,0.22)`}}>
            <Icon.Mic s={19} c="#fff" />
          </div>
          <span style={{fontSize:10.5,color:B.textMuted,marginTop:4,fontFamily:B.sans}}>Record</span>
        </div>
      );
      const on = active===item.id;
      return (
        <button key={item.id} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",
          gap:4,background:"none",border:"none",cursor:"pointer"}}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke={on?B.accent:B.textMuted} strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round">
            {item.d.split(" M").map((d,di)=><path key={di} d={di===0?d:"M"+d}/>)}
          </svg>
          <span style={{fontSize:10.5,fontWeight:on?600:400,fontFamily:B.sans,
            color:on?B.accent:B.textMuted}}>{item.label}</span>
        </button>
      );
    })}
  </div>
);

/* ── Divider ── */
const Divider = () => <div style={{height:0.5,background:`linear-gradient(90deg,transparent,${B.border},transparent)`,margin:"0 0"}}></div>;

/* ════════════════════════
   HOME
   ════════════════════════ */
const HomeScreen = () => (
  <div style={{background:B.bg,minHeight:"100%",fontFamily:B.sans,paddingBottom:110}}>
    <div style={{padding:"66px 26px 0",display:"flex",alignItems:"flex-start",justifyContent:"space-between",
      position:"sticky",top:0,zIndex:5,background:`${B.bg}f5`,backdropFilter:"blur(12px)"}}>
      <div>
        <div style={{fontSize:13,color:B.textMuted,letterSpacing:"0.04em",marginBottom:4}}>Good morning</div>
        <div style={{fontSize:32,fontFamily:B.serif,fontWeight:400,color:B.text,letterSpacing:"-0.01em",lineHeight:1.1}}>Kate</div>
      </div>
    </div>

    <div style={{padding:"40px 26px 0"}}>
      {/* Giant affirmation */}
      <div style={{fontSize:10,letterSpacing:"0.14em",textTransform:"uppercase",color:B.accent,fontWeight:600,marginBottom:20,opacity:.9}}>Your practice</div>
      <div style={{fontSize:32,fontFamily:B.serif,fontStyle:"italic",fontWeight:300,color:B.text,lineHeight:1.55,letterSpacing:"0.01em"}}>
        “I am a highly sought-after professional whose expertise enriches any team I join.”
      </div>
      <div style={{display:"flex",alignItems:"center",gap:14,marginTop:26}}>
        <button style={{width:52,height:52,borderRadius:"50%",border:`1.5px solid ${B.text}`,
          background:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <Icon.Play s={18} c={B.text}/>
        </button>
        <div style={{fontSize:13,color:B.textSoft}}>1:14 · Listened 12 times</div>
        <button title="Open full-screen player" style={{marginLeft:"auto",width:44,height:44,borderRadius:"50%",background:"none",
          border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={B.textMuted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"></path><path d="M9 21H3v-6"></path><path d="M21 3l-7 7"></path><path d="M3 21l7-7"></path></svg>
        </button>
      </div>
    </div>

    <div style={{margin:"36px 0 0",height:0.5,background:B.border}}></div>

    <div style={{padding:"32px 26px 0"}}>
      <button style={{width:"100%",height:54,borderRadius:B.r,background:B.text,
        border:"none",color:B.bg,fontSize:15,fontFamily:B.sans,fontWeight:500,
        display:"flex",alignItems:"center",justifyContent:"center",gap:9,cursor:"pointer",letterSpacing:"-0.01em"}}>
        <Icon.Mic s={16} c={B.bg}/> Record a New Affirmation
      </button>
    </div>

    {/* Warm block — Try Today */}
    <div style={{margin:"32px 0 0",background:B.bgWarm,padding:"28px 26px"}}>
      <div style={{fontSize:10,letterSpacing:"0.14em",textTransform:"uppercase",color:B.warm,fontWeight:600,marginBottom:16,opacity:.9}}>Try today</div>
      <div style={{fontSize:26,fontFamily:B.serif,fontStyle:"italic",fontWeight:300,color:B.text,lineHeight:1.6}}>
        “I am worthy of success and I embrace challenges as opportunities.”
      </div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:18}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <span style={{fontSize:12,color:B.warm,fontWeight:500,padding:"3px 10px",borderRadius:12,background:B.warmSoft}}>Confidence</span>
          <button style={{background:"none",border:"none",cursor:"pointer",padding:"6px 0",fontSize:13,color:B.warm,fontWeight:500,fontFamily:B.sans,display:"flex",alignItems:"center",gap:6}}>
            <Icon.Refresh s={13} c={B.warm}/> Show me another
          </button>
        </div>
        <button style={{background:"none",border:"none",padding:"6px 0",
          color:B.warm,fontSize:13,fontWeight:600,fontFamily:B.sans,display:"flex",alignItems:"center",gap:6,cursor:"pointer"}}>
          <Icon.Mic s={13} c={B.warm}/> Record this
        </button>
      </div>
    </div>

    <div style={{padding:"32px 26px 0"}}>
      {/* Collapsible sections */}
      {[["Thought Transformer","Turn a limiting belief into a powerful mantra."],
        ["Favorites",null],
        ["How it's been",null]].map(([title,sub],i)=>(
        <div key={i} style={{borderBottom:`0.5px solid ${B.border}`}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 0",cursor:"pointer"}}>
            <span style={{fontSize:16,fontWeight:600,color:B.text,fontFamily:B.sans}}>{title}</span>
            <Icon.ChevDown/>
          </div>
          {i===0&&sub&&<div style={{paddingBottom:18}}>
            <div style={{fontSize:14,color:B.textSoft,lineHeight:1.6,marginBottom:12}}>{sub}</div>
            <button style={{background:"none",border:"none",cursor:"pointer",fontSize:14,fontWeight:500,color:B.accent,fontFamily:B.sans,display:"flex",alignItems:"center",gap:5}}>
              Transform a Thought <Icon.ChevRight s={13} c={B.accent}/>
            </button>
          </div>}
        </div>
      ))}
    </div>
    <Nav active="home"/>
  </div>
);

/* ════════════════════════
   LIBRARY
   ════════════════════════ */
const LibraryScreen = () => {
  const recs = [
    {t:"I am a highly sought-after professional...", dur:"1:14", fav:true, tag:"confidence"},
    {t:"I am ready to accept the fact that good things...", dur:"0:16", fav:false, tag:"abundance"},
    {t:"Today I move forward with grace and intention.", dur:"0:21", fav:false, tag:"clarity"},
    {t:"Today I will take a step toward my dreams.", dur:"0:16", fav:false, tag:"confidence"},
    {t:"I let go of what I cannot control.", dur:"0:18", fav:false, tag:"calm"},
    {t:"Affirmation — 12/14/2025", dur:"0:11", fav:false, tag:null},
  ];
  return (
    <div style={{background:B.bg,minHeight:"100%",fontFamily:B.sans,paddingBottom:110}}>
      <div style={{padding:"66px 26px 0",position:"sticky",top:0,zIndex:5,background:`${B.bg}f5`,backdropFilter:"blur(12px)"}}>
        <div style={{fontSize:32,fontFamily:B.serif,fontWeight:400,color:B.text,letterSpacing:"-0.01em",marginBottom:18}}>Library</div>
        <div style={{display:"flex",borderRadius:10,overflow:"hidden",background:B.bgDim}}>
          <div style={{flex:1,padding:"10px 0",fontSize:13,fontWeight:600,textAlign:"center",background:B.bgCard,color:B.text,borderRadius:10,boxShadow:"0 1px 3px rgba(0,0,0,0.05)"}}>Recordings</div>
          <div style={{flex:1,padding:"10px 0",fontSize:13,textAlign:"center",color:B.textSoft}}>Playlists</div>
          <div style={{flex:1,padding:"10px 0",fontSize:13,textAlign:"center",color:B.textSoft}}>Suggestions</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10,marginTop:12,background:B.bgCard,borderRadius:B.r,padding:"11px 14px",border:`0.5px solid ${B.border}`}}>
          <Icon.Search s={16}/><span style={{fontSize:14,color:B.textMuted}}>Search...</span>
        </div>
        <div style={{display:"flex",gap:8,marginTop:12,paddingBottom:14}}>
          {["All","confidence","calm","abundance","clarity"].map((t,i)=>(
            <button key={t} style={{padding:"6px 14px",borderRadius:20,fontSize:13,fontWeight:i===0?600:400,
              background:i===0?B.text:B.accentSoft,color:i===0?B.bg:B.textSoft,border:"none",cursor:"pointer",fontFamily:B.sans,whiteSpace:"nowrap",flexShrink:0}}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div style={{padding:"0 26px"}}>
        {recs.map((r,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",padding:"16px 0",
            borderBottom:i<recs.length-1?`0.5px solid ${B.border}`:"none",gap:14}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:16,fontWeight:500,fontFamily:B.serif,fontStyle:"italic",color:B.text,lineHeight:1.4,
                overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.t}</div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginTop:4}}>
                <span style={{fontSize:12,color:B.textMuted}}>{r.dur}</span>
                {r.tag&&<span style={{fontSize:11,color:B.accent,fontWeight:500}}>{r.tag}</span>}
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",flexShrink:0}}>
              <button style={{width:40,height:44,background:"none",border:"none",padding:0,cursor:"pointer",
                display:"flex",alignItems:"center",justifyContent:"center"}}>
                <Icon.Heart s={18} filled={r.fav} c={r.fav?B.accent:B.textMuted}/>
              </button>
              <button style={{width:44,height:44,borderRadius:"50%",background:B.accentSoft,border:"none",
                display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
                <Icon.Play s={14} c={B.accent}/>
              </button>
              <button style={{width:40,height:44,background:"none",border:"none",padding:0,cursor:"pointer",
                display:"flex",alignItems:"center",justifyContent:"center"}}>
                <Icon.More s={16}/>
              </button>
            </div>
          </div>
        ))}
      </div>
      <Nav active="library"/>
    </div>
  );
};

/* ════════════════════════
   RECORD — Pre
   ════════════════════════ */
const RecordScreen = () => (
  <div style={{background:B.bg,minHeight:"100%",fontFamily:B.sans}}>
    <div style={{padding:"62px 26px 14px",display:"flex",alignItems:"center",gap:10,
      position:"sticky",top:0,zIndex:5,background:`${B.bg}f5`,backdropFilter:"blur(12px)"}}>
      <button style={{background:"none",border:"none",cursor:"pointer",padding:"4px 8px 4px 0"}}>
        <Icon.Back s={20} c={B.textSoft}/>
      </button>
      <span style={{fontSize:17,fontFamily:B.serif,fontWeight:400,color:B.text,fontStyle:"italic"}}>New Affirmation</span>
    </div>

    <div style={{padding:"24px 26px 0"}}>
      {/* Affirmation text */}
      <div style={{background:B.bgWarm,borderRadius:B.rLg,padding:"26px 22px",marginBottom:48,minHeight:130}}>
        <div style={{fontSize:22,fontFamily:B.serif,fontStyle:"italic",fontWeight:300,color:B.text,lineHeight:1.7}}>
          <span style={{background:"rgba(192,122,82,0.2)",borderRadius:3,padding:"0 2px"}}>I am</span>
          {" "}a highly sought-after professional whose expertise enriches any team I join.
        </div>
        <button style={{marginTop:16,background:"none",border:`1px solid ${B.warm}40`,borderRadius:16,
          padding:"7px 14px",cursor:"pointer",fontSize:13,color:B.warm,fontFamily:B.sans,
          display:"inline-flex",alignItems:"center",gap:6}}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={B.warm} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
          Edit text
        </button>
      </div>

      {/* Mic */}
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:16}}>
        <div style={{position:"relative",width:130,height:130,display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{position:"absolute",width:130,height:130,borderRadius:"50%",
            border:`1px solid ${B.warm}30`,animation:"breathRing 3.5s ease-in-out infinite"}}></div>
          <div style={{position:"absolute",width:108,height:108,borderRadius:"50%",
            border:`1px solid ${B.warm}22`,animation:"breathRing 3.5s ease-in-out 1s infinite"}}></div>
          <button style={{width:88,height:88,borderRadius:"50%",background:"none",border:`2px solid ${B.text}`,
            cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
            transition:"all 0.2s"}}>
            <Icon.Mic s={34} c={B.text}/>
          </button>
        </div>
        <div style={{fontSize:13,color:B.textMuted,letterSpacing:"0.02em"}}>Tap to begin</div>
      </div>

      {/* Settings row */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:24,
        marginTop:40,paddingTop:20,borderTop:`0.5px solid ${B.border}`}}>
        {[["Teleprompter",true],["Karaoke",true]].map(([label,on])=>(
          <button key={label} style={{display:"flex",alignItems:"center",gap:7,background:"none",border:"none",cursor:"pointer"}}>
            <span style={{width:44,height:26,borderRadius:13,background:on?B.warm:B.border,
              display:"flex",alignItems:"center",padding:"0 3px",
              justifyContent:on?"flex-end":"flex-start"}}>
              <span style={{width:20,height:20,borderRadius:"50%",background:"#fff"}}></span>
            </span>
            <span style={{fontSize:13,color:B.textSoft,fontFamily:B.sans}}>{label}</span>
          </button>
        ))}
      </div>
    </div>
    <style>{`@keyframes breathRing{0%,100%{transform:scale(1);opacity:.5}50%{transform:scale(1.06);opacity:.9}}`}</style>
  </div>
);

/* ════════════════════════
   RECORD — Save
   ════════════════════════ */
const RecordSaveScreen = () => (
  <div style={{background:B.bg,minHeight:"100%",fontFamily:B.sans,paddingBottom:32}}>
    <div style={{padding:"62px 26px 14px",display:"flex",alignItems:"center",gap:10,
      position:"sticky",top:0,zIndex:5,background:`${B.bg}f5`,backdropFilter:"blur(12px)"}}>
      <button style={{background:"none",border:"none",cursor:"pointer",padding:"4px 8px 4px 0"}}>
        <Icon.Back s={20} c={B.textSoft}/>
      </button>
      <span style={{fontSize:17,fontFamily:B.serif,fontWeight:400,color:B.text,fontStyle:"italic"}}>Save Affirmation</span>
    </div>

    <div style={{padding:"20px 26px 0",display:"flex",flexDirection:"column",gap:24}}>
      {/* Waveform */}
      <div style={{padding:"8px 0 4px"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <button style={{width:38,height:38,borderRadius:"50%",background:B.text,border:"none",cursor:"pointer",
            display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <Icon.Play s={14} c="#fff"/>
          </button>
          <div style={{flex:1,height:28,display:"flex",alignItems:"center",gap:1.5}}>
            {Array.from({length:45}).map((_,i)=>{
              const h=4+Math.abs(Math.sin(i*0.65+1)*20);
              return <div key={i} style={{flex:1,height:h,borderRadius:2,
                background:i<14?B.warm:`${B.text}15`}}></div>;
            })}
          </div>
          <span style={{fontSize:12,color:B.textMuted,flexShrink:0,fontFeatureSettings:'"tnum"'}}>0:16</span>
        </div>
      </div>

      {/* Affirmation */}
      <div style={{background:B.bgWarm,borderRadius:B.rLg,padding:"20px 22px"}}>
        <div style={{fontSize:10,color:B.warm,textTransform:"uppercase",letterSpacing:"0.14em",fontWeight:600,marginBottom:10}}>Your affirmation</div>
        <div style={{fontSize:19,fontFamily:B.serif,fontStyle:"italic",fontWeight:300,color:B.text,lineHeight:1.65}}>
          I am a highly sought-after professional whose expertise enriches any team I join.
        </div>
      </div>

      {/* Form */}
      <div style={{padding:"6px 2px"}}>
        <div style={{fontSize:10,color:B.textMuted,textTransform:"uppercase",letterSpacing:"0.14em",fontWeight:600,marginBottom:10}}>Title</div>
        <div style={{fontSize:15,color:B.text,padding:"12px 14px",background:B.bgCard,border:`0.5px solid ${B.border}`,borderRadius:B.r,marginBottom:20,display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
          <span>I am a highly sought-after pro...</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={B.textMuted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
        </div>

        <div style={{fontSize:10,color:B.textMuted,textTransform:"uppercase",letterSpacing:"0.14em",fontWeight:600,marginBottom:12}}>Playback</div>
        {["Play once","Loop 3 times","Loop until I stop"].map((opt,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 0",
            borderTop:i>0?`0.5px solid ${B.border}`:"none"}}>
            <div style={{width:18,height:18,borderRadius:"50%",
              border:`1.5px solid ${i===2?B.warm:B.border}`,
              display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              {i===2&&<div style={{width:8,height:8,borderRadius:"50%",background:B.warm}}></div>}
            </div>
            <span style={{fontSize:14,color:i===2?B.text:B.textSoft}}>{opt}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <button style={{width:"100%",height:52,borderRadius:B.r,background:B.text,color:B.bg,
          border:"none",fontSize:15,fontWeight:500,fontFamily:B.sans,cursor:"pointer",letterSpacing:"-0.01em"}}>
          Save Recording
        </button>
        <button style={{width:"100%",height:44,borderRadius:B.r,background:"none",
          border:"none",color:B.textSoft,fontSize:14,fontWeight:500,fontFamily:B.sans,cursor:"pointer",
          display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
          <Icon.Redo s={14} c={B.textSoft}/> Try Again
        </button>
        <button style={{width:"100%",height:44,borderRadius:B.r,background:"none",border:"none",
          color:`${B.warm}99`,fontSize:14,fontFamily:B.sans,cursor:"pointer",
          display:"flex",alignItems:"center",justifyContent:"center",gap:7}}>
          <Icon.Trash s={14} c={`${B.warm}99`}/> Discard
        </button>
      </div>
    </div>
  </div>
);

/* ════════════════════════
   IMMERSIVE PLAYER
   Dark-warm version of Breath
   ════════════════════════ */
const ImmersiveScreen = () => (
  <div style={{background:"linear-gradient(170deg,#1C1610 0%,#141009 55%,#0F0C07 100%)",
    minHeight:"100%",fontFamily:B.sans,display:"flex",flexDirection:"column",position:"relative",overflow:"hidden"}}>
    {/* Warm glow */}
    <div style={{position:"absolute",top:"25%",left:"50%",transform:"translateX(-50%)",
      width:300,height:300,borderRadius:"50%",
      background:`radial-gradient(circle, rgba(192,122,82,0.12), transparent 65%)`,
      filter:"blur(50px)",animation:"glow 10s ease-in-out infinite"}}></div>
    <div style={{position:"absolute",top:"40%",left:"25%",
      width:180,height:180,borderRadius:"50%",
      background:`radial-gradient(circle, rgba(74,103,65,0.1), transparent 65%)`,
      filter:"blur(40px)",animation:"glow 10s ease-in-out 4s infinite"}}></div>

    <div style={{padding:"58px 22px 16px",display:"flex",justifyContent:"flex-end",position:"relative",zIndex:2}}>
      <button style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:"50%",
        width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",
      justifyContent:"center",padding:"0 36px",position:"relative",zIndex:2}}>
      <div style={{fontSize:28,fontFamily:B.serif,fontStyle:"italic",fontWeight:300,
        color:"rgba(250,244,236,0.92)",lineHeight:1.75,textAlign:"center",letterSpacing:"0.01em"}}>
        “I am a highly sought-after professional whose expertise enriches any team I join.”
      </div>
    </div>

    <div style={{padding:"0 36px 48px",position:"relative",zIndex:2}}>
      <div style={{width:"100%",height:4,borderRadius:2,background:"rgba(255,255,255,0.1)",marginBottom:32,position:"relative"}}>
        <div style={{width:"35%",height:"100%",borderRadius:2,background:`linear-gradient(90deg, rgba(192,122,82,0.5), rgba(192,122,82,0.85))`}}></div>
        <div style={{position:"absolute",left:"35%",top:"50%",transform:"translate(-50%,-50%)",width:14,height:14,borderRadius:"50%",background:"#E8C9B4",boxShadow:"0 1px 6px rgba(0,0,0,0.4)"}}></div>
      </div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:44}}>
        <button style={{background:"none",border:"none",cursor:"pointer",padding:8,opacity:0.5}}>
          <Icon.Repeat s={20} c="rgba(255,255,255,0.6)"/>
        </button>
        <button style={{width:64,height:64,borderRadius:"50%",background:"rgba(255,255,255,0.08)",
          backdropFilter:"blur(8px)",border:"1px solid rgba(255,255,255,0.08)",
          display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
          <Icon.Pause s={22} c="rgba(250,244,236,0.9)"/>
        </button>
        <button style={{background:"none",border:"none",cursor:"pointer",padding:8,opacity:0.4}}>
          <Icon.Volume s={20} c="rgba(255,255,255,0.6)"/>
        </button>
      </div>
    </div>
    <style>{`@keyframes glow{0%,100%{opacity:.4;transform:translateX(-50%) scale(1)}50%{opacity:.7;transform:translateX(-50%) scale(1.08)}}`}</style>
  </div>
);

/* ════════════════════════
   PLAYLISTS
   ════════════════════════ */
const PlaylistsScreen = () => {
  const lists = [
    {t:"Daily Optimism",   n:4, dur:"4:32"},
    {t:"Morning Confidence",n:3, dur:"3:15"},
    {t:"Before Sleep",     n:5, dur:"6:48"},
    {t:"Worthy & Enough",  n:2, dur:"2:10"},
  ];
  return (
    <div style={{background:B.bg,minHeight:"100%",fontFamily:B.sans,paddingBottom:110}}>
      <div style={{padding:"66px 26px 16px",position:"sticky",top:0,zIndex:5,
        background:`${B.bg}f5`,backdropFilter:"blur(12px)"}}>
        <div style={{fontSize:32,fontFamily:B.serif,fontWeight:400,color:B.text,letterSpacing:"-0.01em",marginBottom:18}}>Library</div>
        <div style={{display:"flex",borderRadius:10,overflow:"hidden",background:B.bgDim}}>
          <div style={{flex:1,padding:"10px 0",fontSize:13,textAlign:"center",color:B.textSoft}}>Recordings</div>
          <div style={{flex:1,padding:"10px 0",fontSize:13,fontWeight:600,textAlign:"center",background:B.bgCard,color:B.text,borderRadius:10,boxShadow:"0 1px 3px rgba(0,0,0,0.05)"}}>Playlists</div>
          <div style={{flex:1,padding:"10px 0",fontSize:13,textAlign:"center",color:B.textSoft}}>Suggestions</div>
        </div>
      </div>
      <div style={{padding:"0 26px",display:"flex",flexDirection:"column"}}>
        {lists.map((p,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",padding:"18px 0",
            borderBottom:`0.5px solid ${B.border}`,gap:14}}>
            <div style={{width:40,height:40,borderRadius:12,background:B.accentSoft,
              display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={B.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01"/>
              </svg>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:16,fontFamily:B.serif,fontStyle:"italic",color:B.text,fontWeight:400}}>{p.t}</div>
              <div style={{fontSize:12,color:B.textMuted,marginTop:2}}>{p.n} affirmations · {p.dur}</div>
            </div>
            <button style={{width:44,height:44,borderRadius:"50%",background:B.accentSoft,border:"none",
              cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <Icon.Play s={12} c={B.accent}/>
            </button>
          </div>
        ))}
        <button style={{width:"100%",height:50,background:"none",
          border:"none",fontSize:14,fontWeight:500,color:B.accent,fontFamily:B.sans,cursor:"pointer",
          display:"flex",alignItems:"center",justifyContent:"center",gap:7,marginTop:8}}>
          <Icon.Plus s={15} c={B.accent}/> Create a Playlist
        </button>
      </div>
      <Nav active="library"/>
    </div>
  );
};

/* ════════════════════════
   PROFILE
   ════════════════════════ */
const ProfileScreen = () => {
  const themes=[{c:"#3B3840",n:"Calm"},{c:B.warm,n:"Golden"},{c:"#3B9DAD",n:"Ocean"},
    {c:"#4A8C6A",n:"Forest"},{c:"#7D5EAA",n:"Lavender"},{c:"#C0506A",n:"Rose"}];
  const Row=({icon,label,detail,toggle,on})=>(
    <div style={{display:"flex",alignItems:"center",gap:14,padding:"14px 0",borderBottom:`0.5px solid ${B.border}`}}>
      <div style={{width:34,height:34,borderRadius:9,background:B.bgDim,
        display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{icon}</div>
      <div style={{flex:1}}>
        <div style={{fontSize:15,color:B.text,fontWeight:500}}>{label}</div>
        {detail&&<div style={{fontSize:12,color:B.textMuted,marginTop:1}}>{detail}</div>}
      </div>
      {toggle?(
        <div style={{width:44,height:24,borderRadius:12,background:on?B.accent:B.border,position:"relative",cursor:"pointer",flexShrink:0}}>
          <div style={{width:18,height:18,borderRadius:"50%",background:"#fff",position:"absolute",top:3,left:on?22:3,transition:"left 0.2s"}}></div>
        </div>
      ):<Icon.ChevRight s={15}/>}
    </div>
  );
  return (
    <div style={{background:B.bg,minHeight:"100%",fontFamily:B.sans,paddingBottom:110}}>
      <div style={{padding:"66px 26px 0"}}>
        <div style={{fontSize:32,fontFamily:B.serif,fontWeight:400,color:B.text,letterSpacing:"-0.01em",marginBottom:24}}>Profile</div>
        {/* Avatar */}
        <div style={{display:"flex",alignItems:"center",gap:16,padding:"4px 0 10px",marginBottom:24}}>
          <div style={{width:52,height:52,borderRadius:"50%",background:B.bgWarm,
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:22,fontFamily:B.serif,fontStyle:"italic",color:B.warm}}>K</div>
          <div>
            <div style={{fontSize:17,fontFamily:B.serif,fontStyle:"italic",color:B.text}}>Kate</div>
            <div style={{fontSize:13,color:B.textMuted,marginTop:1}}>kate@example.com</div>
          </div>
        </div>

        {/* Theme */}
        <div style={{marginBottom:28}}>
          <div style={{fontSize:10,color:B.textMuted,textTransform:"uppercase",letterSpacing:"0.14em",fontWeight:600,marginBottom:14}}>Colour theme</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:12}}>
            {themes.map((th,i)=>(
              <div key={i} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
                <div style={{width:36,height:36,borderRadius:"50%",background:th.c,
                  boxShadow:i===4?`0 0 0 2.5px ${B.bg}, 0 0 0 4px ${th.c}`:"none"}}></div>
                <span style={{fontSize:9,color:B.textMuted}}>{th.n}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Settings */}
        {[{title:"Playback",rows:[
            {icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={B.textSoft} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>,label:"Default loop",detail:"Loop until stopped"},
            {icon:<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={B.textSoft} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,label:"Playback timer",detail:"No limit"},
          ]},
          {title:"Preferences",rows:[
            {icon:<Icon.Bell s={15} c={B.textSoft}/>,label:"Notifications",detail:"Gentle daily invitation",toggle:true,on:true},
            {icon:<Icon.Volume s={15} c={B.textSoft}/>,label:"Auto-save sounds",detail:"Remember my ambient choices",toggle:true,on:true},
          ]}
        ].map((g,gi)=>(
          <div key={gi} style={{marginBottom:24}}>
            <div style={{fontSize:10,color:B.textMuted,textTransform:"uppercase",letterSpacing:"0.14em",fontWeight:600,marginBottom:4}}>{g.title}</div>
            <div>
              {g.rows.map((r,ri)=><Row key={ri} {...r}/>)}
            </div>
          </div>
        ))}
        <button style={{width:"100%",height:46,background:"none",
          border:"none",fontSize:14,fontWeight:500,color:B.textSoft,fontFamily:B.sans,cursor:"pointer"}}>
          Sign Out
        </button>
      </div>
      <Nav active="profile"/>
    </div>
  );
};

/* ════════════════════════
   ONBOARDING — Vibe
   ════════════════════════ */
const OnboardVibeScreen = () => {
  const opts=[
    {v:"focused",l:"Focused",sub:"Clean, disciplined, minimal.",
      icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8"/></svg>},
    {v:"grounded",l:"Grounded",sub:"Calm, steady, spacious.",
      icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M17 8C8 10 5.9 16.17 3.82 20.58a1 1 0 001.71.9"/><path d="M4 15c2.7-2 5-2 7-2 4 0 6 2 6 2"/></svg>},
    {v:"energized",l:"Energized",sub:"Forward-moving, confident, sharp.",
      icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>},
  ];
  const active="grounded";
  return (
    <div style={{background:B.bg,minHeight:"100%",fontFamily:B.sans,display:"flex",flexDirection:"column"}}>
      <div style={{display:"flex",justifyContent:"center",gap:8,paddingTop:64,paddingBottom:4}}>
        {[0,1,2,3,4,5].map(i=>(
          <div key={i} style={{height:5,borderRadius:3,width:i===0?24:5,
            background:i===0?`${B.accent}80`:i<0?`${B.accent}30`:B.border,transition:"all .4s"}}></div>
        ))}
      </div>
      <div style={{flex:1,padding:"28px 26px 0"}}>
        <div style={{fontSize:10,letterSpacing:"0.14em",textTransform:"uppercase",color:B.accent,fontWeight:600,marginBottom:16}}>Welcome</div>
        <div style={{fontSize:34,fontFamily:B.serif,fontStyle:"italic",fontWeight:300,color:B.text,lineHeight:1.3,marginBottom:10}}>
          How should this space feel?
        </div>
        <div style={{fontSize:15,color:B.textMuted,lineHeight:1.6,marginBottom:32}}>
          Choose the tone that supports the way you work.
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {opts.map(opt=>{
            const on=opt.v===active;
            return (
              <div key={opt.v} style={{background:B.bgCard,borderRadius:B.rLg,padding:"18px",cursor:"pointer",
                border:`1px solid ${on?`${B.accent}55`:B.border}`,
                boxShadow:on?`0 2px 16px rgba(74,103,65,0.08)`:"none",
                display:"flex",alignItems:"center",gap:14}}>
                <div style={{width:42,height:42,borderRadius:12,flexShrink:0,
                  background:on?B.accentSoft:B.bgDim,color:on?B.accent:B.textMuted,
                  display:"flex",alignItems:"center",justifyContent:"center"}}>{opt.icon}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:16,fontFamily:B.serif,fontStyle:"italic",fontWeight:on?500:400,color:on?B.text:B.textSoft}}>{opt.l}</div>
                  <div style={{fontSize:13,color:B.textMuted,marginTop:2}}>{opt.sub}</div>
                </div>
                {on&&<Icon.Check s={16} c={B.accent}/>}
              </div>
            );
          })}
        </div>
      </div>
      <div style={{padding:"24px 26px 44px"}}>
        <button style={{width:"100%",height:52,borderRadius:B.r,background:B.text,color:B.bg,
          border:"none",fontSize:16,fontWeight:500,fontFamily:B.sans,cursor:"pointer",letterSpacing:"-0.01em"}}>
          Continue
        </button>
      </div>
    </div>
  );
};

/* ════════════════════════
   ONBOARDING — Intention
   ════════════════════════ */
const OnboardIntentionScreen = () => {
  const oIc=(d)=>(<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{d.split("|").map((p,i)=><path key={i} d={p}></path>)}</svg>);
  const opts=[
    {v:"confidence",l:"Build Confidence",ic:oIc("M23 6l-9.5 9.5-5-5L1 18|M17 6h6v6")},
    {v:"calm",l:"Find Calm",ic:oIc("M9.59 4.59A2 2 0 1111 8H2|M12.59 19.41A2 2 0 1014 16H2|M17.73 7.73A2.5 2.5 0 1119.5 12H2")},
    {v:"self-love",l:"Practice Self-Love",ic:oIc("M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z")},
    {v:"focus",l:"Sharpen Focus",ic:oIc("M12 2a10 10 0 100 20 10 10 0 000-20z|M12 6a6 6 0 100 12 6 6 0 000-12z|M12 10a2 2 0 100 4 2 2 0 000-4z")},
    {v:"healing",l:"Support Healing",ic:oIc("M20.24 12.24a6 6 0 00-8.49-8.49L5 10.5V19h8.5z|M16 8L2 22|M17.5 15H9")},
    {v:"general",l:"Just Exploring",ic:oIc("M12 2a10 10 0 100 20 10 10 0 000-20z|M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36z")},
  ];
  const active="confidence";
  return (
    <div style={{background:B.bg,minHeight:"100%",fontFamily:B.sans,display:"flex",flexDirection:"column"}}>
      <div style={{display:"flex",justifyContent:"center",gap:8,paddingTop:64,paddingBottom:4}}>
        {[0,1,2,3,4,5].map(i=>(
          <div key={i} style={{height:5,borderRadius:3,width:i===1?24:5,
            background:i===1?`${B.accent}80`:i<1?`${B.accent}30`:B.border}}></div>
        ))}
      </div>
      <div style={{flex:1,padding:"28px 26px 0"}}>
        <div style={{fontSize:34,fontFamily:B.serif,fontStyle:"italic",fontWeight:300,color:B.text,lineHeight:1.3,marginBottom:10}}>
          What brings you here?
        </div>
        <div style={{fontSize:15,color:B.textMuted,lineHeight:1.6,marginBottom:32}}>
          There's no wrong answer. This shapes your experience.
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {opts.map(opt=>{
            const on=opt.v===active;
            return (
              <div key={opt.v} style={{background:B.bgCard,borderRadius:B.rLg,padding:"14px 18px",cursor:"pointer",
                border:`1px solid ${on?`${B.accent}55`:B.border}`,
                boxShadow:on?`0 2px 14px rgba(74,103,65,0.08)`:"none",
                display:"flex",alignItems:"center",gap:14}}>
                <div style={{width:38,height:38,borderRadius:11,flexShrink:0,background:on?B.accentSoft:B.bgDim,color:on?B.accent:B.textMuted,display:"flex",alignItems:"center",justifyContent:"center"}}>{opt.ic}</div>
                <span style={{fontSize:16,fontFamily:B.serif,fontStyle:"italic",fontWeight:on?500:400,flex:1,
                  color:on?B.text:B.textSoft}}>{opt.l}</span>
                {on&&<Icon.Check s={16} c={B.accent}/>}
              </div>
            );
          })}
        </div>
      </div>
      <div style={{padding:"24px 26px 44px"}}>
        <button style={{width:"100%",height:52,borderRadius:B.r,background:B.text,color:B.bg,
          border:"none",fontSize:16,fontWeight:500,fontFamily:B.sans,cursor:"pointer"}}>Continue</button>
      </div>
    </div>
  );
};

/* ════════════════════════
   RECORD — In progress
   ════════════════════════ */
const RecordingLiveScreen = () => {
  const words = "I am a highly sought-after professional whose expertise enriches any team I join.".split(" ");
  const spoken = 6;
  return (
    <div style={{background:B.bg,minHeight:"100%",fontFamily:B.sans,display:"flex",flexDirection:"column"}}>
      <div style={{padding:"62px 26px 14px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <button style={{background:"none",border:"none",cursor:"pointer",fontSize:14,color:B.textMuted,fontFamily:B.sans,padding:"4px 0"}}>Cancel</button>
        <div style={{display:"flex",alignItems:"center",gap:7}}>
          <span style={{width:8,height:8,borderRadius:"50%",background:B.warm,animation:"recBlink 1.6s ease-in-out infinite"}}></span>
          <span style={{fontSize:13,color:B.textSoft,fontFeatureSettings:'"tnum"'}}>0:07</span>
        </div>
      </div>

      <div style={{padding:"18px 26px 0"}}>
        <div style={{background:B.bgWarm,borderRadius:B.rLg,padding:"26px 22px"}}>
          <div style={{fontSize:10,color:B.warm,textTransform:"uppercase",letterSpacing:"0.14em",fontWeight:600,marginBottom:14}}>Read along</div>
          <div style={{fontSize:23,fontFamily:B.serif,fontStyle:"italic",fontWeight:300,lineHeight:1.7}}>
            {words.map((w,i)=>(
              <span key={i} style={{color:i<spoken?B.text:B.textMuted,
                background:i<spoken?"rgba(192,122,82,0.18)":"none",borderRadius:3,padding:"0 2px"}}>{w} </span>
            ))}
          </div>
        </div>
      </div>

      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:36,padding:"0 26px"}}>
        <div style={{display:"flex",alignItems:"center",gap:3,height:56}}>
          {Array.from({length:34}).map((_,i)=>{
            const h=10+Math.abs(Math.sin(i*0.7+2))*40;
            return <div key={i} style={{width:3.5,height:h,borderRadius:2,background:i%5===0?B.warm:`${B.warm}66`,
              animation:`liveWave 1.1s ease-in-out ${(i%7)*0.12}s infinite`,transformOrigin:"center"}}></div>;
          })}
        </div>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:14}}>
          <div style={{position:"relative",width:120,height:120,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <div style={{position:"absolute",inset:0,borderRadius:"50%",border:`1px solid ${B.warm}30`,animation:"recRing 2.2s ease-in-out infinite"}}></div>
            <button style={{width:84,height:84,borderRadius:"50%",background:B.warm,border:"none",cursor:"pointer",
              display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 6px 22px rgba(192,122,82,0.35)"}}>
              <span style={{width:26,height:26,borderRadius:7,background:"#fff"}}></span>
            </button>
          </div>
          <div style={{fontSize:13,color:B.textMuted,letterSpacing:"0.02em"}}>Tap to finish</div>
        </div>
      </div>
      <div style={{height:48}}></div>
      <style>{`@keyframes liveWave{0%,100%{transform:scaleY(.4)}50%{transform:scaleY(1)}}
        @keyframes recBlink{0%,100%{opacity:1}50%{opacity:.25}}
        @keyframes recRing{0%,100%{transform:scale(1);opacity:.5}50%{transform:scale(1.07);opacity:.9}}`}</style>
    </div>
  );
};

/* ════════════════════════
   EMPTY STATES
   ════════════════════════ */
const HomeEmptyScreen = () => (
  <div style={{background:B.bg,minHeight:"100%",fontFamily:B.sans,paddingBottom:110}}>
    <div style={{padding:"66px 26px 0"}}>
      <div style={{fontSize:13,color:B.textMuted,letterSpacing:"0.04em",marginBottom:4}}>Good morning</div>
      <div style={{fontSize:32,fontFamily:B.serif,fontWeight:400,color:B.text,letterSpacing:"-0.01em",lineHeight:1.1}}>Kate</div>
    </div>

    <div style={{padding:"44px 26px 0"}}>
      <div style={{fontSize:10,letterSpacing:"0.14em",textTransform:"uppercase",color:B.accent,fontWeight:600,marginBottom:20}}>Begin</div>
      <div style={{fontSize:30,fontFamily:B.serif,fontStyle:"italic",fontWeight:300,color:B.text,lineHeight:1.55}}>
        Your practice begins with a single sentence, spoken in your own voice.
      </div>
      <button style={{marginTop:28,width:"100%",height:54,borderRadius:B.r,background:B.text,color:B.bg,
        border:"none",fontSize:15,fontWeight:500,fontFamily:B.sans,cursor:"pointer",
        display:"flex",alignItems:"center",justifyContent:"center",gap:9}}>
        <Icon.Mic s={16} c={B.bg}/> Record Your First Affirmation
      </button>
    </div>

    <div style={{margin:"40px 0 0",background:B.bgWarm,padding:"28px 26px"}}>
      <div style={{fontSize:10,letterSpacing:"0.14em",textTransform:"uppercase",color:B.warm,fontWeight:600,marginBottom:16}}>Not sure where to start?</div>
      <div style={{fontSize:24,fontFamily:B.serif,fontStyle:"italic",fontWeight:300,color:B.text,lineHeight:1.6}}>
        “I am worthy of success and I embrace challenges as opportunities.”
      </div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:18}}>
        <button style={{background:"none",border:"none",cursor:"pointer",fontSize:13,color:B.warm,fontWeight:500,fontFamily:B.sans,display:"flex",alignItems:"center",gap:6,padding:0}}>
          <Icon.Refresh s={13} c={B.warm}/> Show me another
        </button>
        <button style={{background:"none",border:"none",padding:"6px 0",
          color:B.warm,fontSize:13,fontWeight:600,fontFamily:B.sans,display:"flex",alignItems:"center",gap:6,cursor:"pointer"}}>
          <Icon.Mic s={13} c={B.warm}/> Record this
        </button>
      </div>
    </div>

    <div style={{padding:"36px 26px 0"}}>
      {[["Record","Speak an affirmation in your own words."],
        ["Listen daily","Your voice, looped gently — morning or night."],
        ["Notice the shift","Small repetitions, steady change."]].map(([t,sub],i)=>(
        <div key={i} style={{display:"flex",gap:16,padding:"14px 0",borderBottom:i<2?`0.5px solid ${B.border}`:"none"}}>
          <div style={{fontSize:15,fontFamily:B.serif,fontStyle:"italic",color:B.textMuted,width:22,flexShrink:0}}>{i+1}</div>
          <div>
            <div style={{fontSize:15,fontWeight:600,color:B.text}}>{t}</div>
            <div style={{fontSize:13,color:B.textSoft,marginTop:2,lineHeight:1.5}}>{sub}</div>
          </div>
        </div>
      ))}
    </div>
    <Nav active="home"/>
  </div>
);

const LibraryEmptyScreen = () => (
  <div style={{background:B.bg,minHeight:"100%",fontFamily:B.sans,paddingBottom:110,display:"flex",flexDirection:"column"}}>
    <div style={{padding:"66px 26px 0"}}>
      <div style={{fontSize:32,fontFamily:B.serif,fontWeight:400,color:B.text,marginBottom:18}}>Library</div>
      <div style={{display:"flex",borderRadius:10,overflow:"hidden",background:B.bgDim}}>
        <div style={{flex:1,padding:"10px 0",fontSize:13,fontWeight:600,textAlign:"center",background:B.bgCard,color:B.text,borderRadius:10,boxShadow:"0 1px 3px rgba(0,0,0,0.05)"}}>Recordings</div>
        <div style={{flex:1,padding:"10px 0",fontSize:13,textAlign:"center",color:B.textSoft}}>Playlists</div>
        <div style={{flex:1,padding:"10px 0",fontSize:13,textAlign:"center",color:B.textSoft}}>Suggestions</div>
      </div>
    </div>
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 44px",textAlign:"center"}}>
      <div style={{width:64,height:64,borderRadius:"50%",background:B.bgDim,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:22}}>
        <Icon.Mic s={24} c={B.textMuted}/>
      </div>
      <div style={{fontSize:24,fontFamily:B.serif,fontStyle:"italic",fontWeight:300,color:B.text,lineHeight:1.4}}>Nothing here yet</div>
      <div style={{fontSize:14,color:B.textSoft,lineHeight:1.6,marginTop:10,maxWidth:260}}>
        Affirmations you record will live here, in your own voice.
      </div>
      <button style={{marginTop:26,height:48,padding:"0 24px",borderRadius:B.r,background:B.text,color:B.bg,
        border:"none",fontSize:14,fontWeight:500,fontFamily:B.sans,cursor:"pointer",
        display:"flex",alignItems:"center",gap:8}}>
        <Icon.Mic s={15} c={B.bg}/> Record an Affirmation
      </button>
      <button style={{marginTop:12,background:"none",border:"none",cursor:"pointer",fontSize:13,color:B.accent,fontWeight:500,fontFamily:B.sans}}>
        Or browse suggestions
      </button>
    </div>
    <Nav active="library"/>
  </div>
);

const PlaylistsEmptyScreen = () => (
  <div style={{background:B.bg,minHeight:"100%",fontFamily:B.sans,paddingBottom:110,display:"flex",flexDirection:"column"}}>
    <div style={{padding:"66px 26px 0"}}>
      <div style={{fontSize:32,fontFamily:B.serif,fontWeight:400,color:B.text,marginBottom:18}}>Library</div>
      <div style={{display:"flex",borderRadius:10,overflow:"hidden",background:B.bgDim}}>
        <div style={{flex:1,padding:"10px 0",fontSize:13,textAlign:"center",color:B.textSoft}}>Recordings</div>
        <div style={{flex:1,padding:"10px 0",fontSize:13,fontWeight:600,textAlign:"center",background:B.bgCard,color:B.text,borderRadius:10,boxShadow:"0 1px 3px rgba(0,0,0,0.05)"}}>Playlists</div>
        <div style={{flex:1,padding:"10px 0",fontSize:13,textAlign:"center",color:B.textSoft}}>Suggestions</div>
      </div>
    </div>
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 44px",textAlign:"center"}}>
      <div style={{width:64,height:64,borderRadius:"50%",background:B.accentSoft,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:22}}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={B.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6h13"></path><path d="M8 12h13"></path><path d="M8 18h13"></path><path d="M3 6h.01"></path><path d="M3 12h.01"></path><path d="M3 18h.01"></path></svg>
      </div>
      <div style={{fontSize:24,fontFamily:B.serif,fontStyle:"italic",fontWeight:300,color:B.text,lineHeight:1.4}}>Build a ritual</div>
      <div style={{fontSize:14,color:B.textSoft,lineHeight:1.6,marginTop:10,maxWidth:270}}>
        Group affirmations into a sequence that plays as one — morning confidence, before sleep.
      </div>
      <button style={{marginTop:26,height:48,padding:"0 24px",borderRadius:B.r,background:B.text,
        border:"none",fontSize:14,color:B.bg,fontWeight:500,fontFamily:B.sans,cursor:"pointer",
        display:"flex",alignItems:"center",gap:8}}>
        <Icon.Plus s={15} c={B.bg}/> Create a Playlist
      </button>
    </div>
    <Nav active="library"/>
  </div>
);

/* ════════════════════════
   HOW IT'S BEEN — exploration
   Qualitative reflection · no scores, no streaks
   ════════════════════════ */

/* A · Home with the section open */
const HomeReflectionsOpenScreen = () => (
  <div style={{background:B.bg,minHeight:"100%",fontFamily:B.sans,paddingBottom:110}}>
    <div style={{padding:"66px 26px 0"}}>
      <div style={{fontSize:13,color:B.textMuted,letterSpacing:"0.04em",marginBottom:4}}>Good morning</div>
      <div style={{fontSize:32,fontFamily:B.serif,fontWeight:400,color:B.text,letterSpacing:"-0.01em",lineHeight:1.1}}>Kate</div>
    </div>
    <div style={{padding:"40px 26px 0"}}>
      <div style={{fontSize:10,letterSpacing:"0.14em",textTransform:"uppercase",color:B.accent,fontWeight:600,marginBottom:20,opacity:.9}}>Your practice</div>
      <div style={{fontSize:32,fontFamily:B.serif,fontStyle:"italic",fontWeight:300,color:B.text,lineHeight:1.55,letterSpacing:"0.01em"}}>
        “I am a highly sought-after professional whose expertise enriches any team I join.”
      </div>
      <div style={{display:"flex",alignItems:"center",gap:14,marginTop:26}}>
        <button style={{width:52,height:52,borderRadius:"50%",border:`1.5px solid ${B.text}`,
          background:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <Icon.Play s={18} c={B.text}/>
        </button>
        <div style={{fontSize:13,color:B.textSoft}}>1:14 · Listened 12 times</div>
      </div>
    </div>
    <div style={{margin:"36px 0 0",height:0.5,background:B.border}}></div>
    <div style={{padding:"20px 26px 0"}}>
      {["Thought Transformer","Favorites"].map((title,i)=>(
        <div key={i} style={{borderBottom:`0.5px solid ${B.border}`}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 0",cursor:"pointer"}}>
            <span style={{fontSize:16,fontWeight:600,color:B.text,fontFamily:B.sans}}>{title}</span>
            <Icon.ChevDown/>
          </div>
        </div>
      ))}
      {/* How it's been — open */}
      <div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 0",cursor:"pointer"}}>
          <span style={{fontSize:16,fontWeight:600,color:B.text,fontFamily:B.sans}}>How it's been</span>
          <span style={{transform:"rotate(180deg)",display:"flex"}}><Icon.ChevDown/></span>
        </div>
        <div style={{paddingBottom:24}}>
          <div style={{fontSize:14,color:B.textSoft,lineHeight:1.6,marginBottom:16}}>Words you've left after listening, lately:</div>
          <div style={{fontSize:24,fontFamily:B.serif,fontStyle:"italic",fontWeight:300,lineHeight:1.9,color:B.text}}>
            lighter · steadier · more sure of myself
          </div>
          <button style={{marginTop:18,background:"none",border:"none",cursor:"pointer",fontSize:14,fontWeight:500,color:B.accent,fontFamily:B.sans,display:"flex",alignItems:"center",gap:5,padding:0}}>
            See your reflections <Icon.ChevRight s={13} c={B.accent}/>
          </button>
        </div>
      </div>
    </div>
    <Nav active="home"/>
  </div>
);

/* B · Full reflections page */
const ReflectionsScreen = () => {
  const groups=[
    {when:"This week",items:[
      {w:"lighter",ctx:"after Morning Confidence",day:"Sunday"},
      {w:"steadier",ctx:"after “I let go of what I cannot control”",day:"Thursday"},
    ]},
    {when:"Earlier",items:[
      {w:"more sure of myself",ctx:"after “I am a highly sought-after professional…”",day:"Last Tuesday"},
      {w:"calm",ctx:"after Before Sleep",day:"Two weeks ago"},
      {w:"tender",ctx:"after Worthy & Enough",day:"Two weeks ago"},
    ]},
  ];
  return (
    <div style={{background:B.bg,minHeight:"100%",fontFamily:B.sans,paddingBottom:40}}>
      <div style={{padding:"62px 26px 14px",display:"flex",alignItems:"center",gap:10}}>
        <button style={{background:"none",border:"none",cursor:"pointer",padding:"4px 8px 4px 0"}}>
          <Icon.Back s={20} c={B.textSoft}/>
        </button>
        <span style={{fontSize:17,fontFamily:B.serif,fontWeight:400,color:B.text,fontStyle:"italic"}}>How it's been</span>
      </div>
      <div style={{padding:"14px 26px 0"}}>
        <div style={{fontSize:15,color:B.textSoft,lineHeight:1.65,marginBottom:34}}>
          A quiet record of how practice has felt — in your words, only when you choose to leave them.
        </div>
        {groups.map((g,gi)=>(
          <div key={gi} style={{marginBottom:30}}>
            <div style={{fontSize:10,letterSpacing:"0.14em",textTransform:"uppercase",color:B.accent,fontWeight:600,marginBottom:6,opacity:.9}}>{g.when}</div>
            {g.items.map((it,i)=>(
              <div key={i} style={{padding:"18px 0",borderBottom:`0.5px solid ${B.border}`}}>
                <div style={{fontSize:12,color:B.textMuted,marginBottom:6}}>{it.day}</div>
                <div style={{fontSize:25,fontFamily:B.serif,fontStyle:"italic",fontWeight:300,color:B.text,lineHeight:1.3}}>“{it.w}”</div>
                <div style={{fontSize:13,color:B.textSoft,marginTop:6}}>{it.ctx}</div>
              </div>
            ))}
          </div>
        ))}
        <div style={{background:B.bgDim,borderRadius:B.rLg,padding:"16px 18px",fontSize:13,color:B.textSoft,lineHeight:1.6}}>
          This page holds only what you choose to add. Nothing is counted, scored, or tracked automatically.
        </div>
      </div>
    </div>
  );
};

/* C · Post-listen capture (dark, follows immersive player) */
const FeelingCaptureScreen = () => {
  const words=["lighter","steadier","calm","tender","strong"];
  const active="lighter";
  return (
    <div style={{background:"linear-gradient(170deg,#1C1610 0%,#141009 55%,#0F0C07 100%)",
      minHeight:"100%",fontFamily:B.sans,display:"flex",flexDirection:"column",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:"30%",left:"50%",transform:"translateX(-50%)",
        width:280,height:280,borderRadius:"50%",
        background:"radial-gradient(circle, rgba(192,122,82,0.1), transparent 65%)",filter:"blur(50px)"}}></div>
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 36px",position:"relative",zIndex:2}}>
        <div style={{fontSize:10,color:"rgba(255,255,255,0.3)",letterSpacing:"0.14em",textTransform:"uppercase",fontWeight:600,marginBottom:22}}>A moment before you go</div>
        <div style={{fontSize:27,fontFamily:B.serif,fontStyle:"italic",fontWeight:300,color:"rgba(250,244,236,0.92)",lineHeight:1.5,textAlign:"center",marginBottom:40}}>
          How do you feel right now?
        </div>
        <div style={{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:10,maxWidth:300}}>
          {words.map(w=>{
            const on=w===active;
            return (
              <button key={w} style={{padding:"11px 20px",borderRadius:24,cursor:"pointer",
                fontSize:16,fontFamily:B.serif,fontStyle:"italic",
                background:on?"rgba(192,122,82,0.22)":"rgba(255,255,255,0.05)",
                border:`1px solid ${on?"rgba(192,122,82,0.55)":"rgba(255,255,255,0.1)"}`,
                color:on?"rgba(250,235,222,0.95)":"rgba(250,244,236,0.6)"}}>{w}</button>
            );
          })}
        </div>
        <button style={{marginTop:20,padding:"10px 20px",background:"none",border:"none",cursor:"pointer",
          fontSize:14,color:"rgba(255,255,255,0.35)",fontFamily:B.sans}}>or write your own…</button>
      </div>
      <div style={{padding:"0 36px 56px",display:"flex",flexDirection:"column",alignItems:"center",gap:16,position:"relative",zIndex:2}}>
        <button style={{width:"100%",height:52,borderRadius:B.r,background:"rgba(250,244,236,0.92)",color:"#1C1610",
          border:"none",fontSize:15,fontWeight:500,fontFamily:B.sans,cursor:"pointer"}}>Keep this</button>
        <button style={{background:"none",border:"none",cursor:"pointer",fontSize:14,color:"rgba(255,255,255,0.4)",fontFamily:B.sans,padding:"6px 12px"}}>Skip</button>
      </div>
    </div>
  );
};

/* ════════════════════════
   CANVAS
   ════════════════════════ */
const App = () => (
  <DesignCanvas title="Resonance — Breath v3" subtitle="Minimal / high-end pass · one accent per screen · de-boxed · hairlines · 4-tab nav · motion: 500ms cubic-bezier(.22,1,.36,1), fades only">
    <DCSection id="home" title="Home">
      <DCArtboard id="home-a" label="Home" width={393} height={1190}><IOSDevice width={393} height={1190}><HomeScreen/></IOSDevice></DCArtboard>
    </DCSection>
    <DCSection id="library" title="Library">
      <DCArtboard id="lib-a" label="Library" width={393} height={920}><IOSDevice width={393} height={920}><LibraryScreen/></IOSDevice></DCArtboard>
    </DCSection>
    <DCSection id="record" title="Recording Flow">
      <DCArtboard id="rec-a" label="Record — ready to begin" width={393} height={800}><IOSDevice width={393} height={800}><RecordScreen/></IOSDevice></DCArtboard>
      <DCArtboard id="rec-live" label="Record — in progress" width={393} height={852}><IOSDevice width={393} height={852}><RecordingLiveScreen/></IOSDevice></DCArtboard>
      <DCArtboard id="rec-b" label="Record — save" width={393} height={1000}><IOSDevice width={393} height={1000}><RecordSaveScreen/></IOSDevice></DCArtboard>
    </DCSection>
    <DCSection id="player" title="Immersive Player">
      <DCArtboard id="imm-a" label="Immersive — dark warm" width={393} height={852}><IOSDevice width={393} height={852}><ImmersiveScreen/></IOSDevice></DCArtboard>
    </DCSection>
    <DCSection id="playlists" title="Library — Playlists Tab">
      <DCArtboard id="pl-a" label="Playlists (Library tab)" width={393} height={760}><IOSDevice width={393} height={760}><PlaylistsScreen/></IOSDevice></DCArtboard>
    </DCSection>
    <DCSection id="profile" title="Profile">
      <DCArtboard id="prof-a" label="Profile & settings" width={393} height={1040}><IOSDevice width={393} height={1040}><ProfileScreen/></IOSDevice></DCArtboard>
    </DCSection>
    <DCSection id="onboarding" title="Onboarding">
      <DCArtboard id="ob-a" label="Step 1 — How should this feel?" width={393} height={780}><IOSDevice width={393} height={780}><OnboardVibeScreen/></IOSDevice></DCArtboard>
      <DCArtboard id="ob-b" label="Step 2 — What brings you here?" width={393} height={820}><IOSDevice width={393} height={820}><OnboardIntentionScreen/></IOSDevice></DCArtboard>
    </DCSection>
    <DCSection id="empty" title="First Run — Empty States">
      <DCArtboard id="empty-home" label="Home — no recordings" width={393} height={1140}><IOSDevice width={393} height={1140}><HomeEmptyScreen/></IOSDevice></DCArtboard>
      <DCArtboard id="empty-lib" label="Library — empty" width={393} height={852}><IOSDevice width={393} height={852}><LibraryEmptyScreen/></IOSDevice></DCArtboard>
      <DCArtboard id="empty-pl" label="Playlists tab — empty" width={393} height={760}><IOSDevice width={393} height={760}><PlaylistsEmptyScreen/></IOSDevice></DCArtboard>
    </DCSection>
    <DCSection id="reflections" title="How It's Been — Exploration" subtitle="Qualitative reflection · words the user chooses to leave · no scores, streaks, or counts">
      <DCArtboard id="refl-a" label="A · Home — section open" width={393} height={1060}><IOSDevice width={393} height={1060}><HomeReflectionsOpenScreen/></IOSDevice></DCArtboard>
      <DCArtboard id="refl-b" label="B · Reflections page" width={393} height={1080}><IOSDevice width={393} height={1080}><ReflectionsScreen/></IOSDevice></DCArtboard>
      <DCArtboard id="refl-c" label="C · Post-listen capture" width={393} height={852}><IOSDevice width={393} height={852}><FeelingCaptureScreen/></IOSDevice></DCArtboard>
    </DCSection>
  </DesignCanvas>
);

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
