import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

const api = async (path, options={}) => {
  const r = await fetch(path, {headers: {"Content-Type":"application/json", ...(options.headers||{})}, ...options});
  const data = await r.json().catch(()=>({}));
  if (!r.ok) throw new Error(data.error || "Request failed");
  return data;
};

function App(){
  const [projects,setProjects]=useState([]);
  const [skills,setSkills]=useState([]);
  const [category,setCategory]=useState("All");
  const [sent,setSent]=useState(false);
  const [error,setError]=useState("");

  useEffect(()=>{ Promise.all([api("/api/projects"),api("/api/skills")]).then(([p,s])=>{setProjects(p);setSkills(s)}).catch(e=>setError(e.message)); },[]);
  const cats=["All",...new Set(projects.map(p=>p.category))];
  const shown=category==="All"?projects:projects.filter(p=>p.category===category);

  async function contact(e){
    e.preventDefault(); setError("");
    const f=new FormData(e.currentTarget);
    try { await api("/api/contact",{method:"POST",body:JSON.stringify(Object.fromEntries(f))}); setSent(true); e.currentTarget.reset(); }
    catch(e){setError(e.message)}
  }

  return <div>
    <nav><b>Prince Web Devs</b><div><a href="#about">About</a><a href="#skills">Skills</a><a href="#projects">Projects</a><a href="#contact">Contact</a><a href="/admin">Admin</a></div></nav>
    <header className="hero"><p className="eyebrow">WEB DEVELOPER</p><h1>Building websites that<br/><span>actually work.</span></h1><p>I build modern websites and full-stack web applications.</p><a className="btn" href="#projects">View Projects</a></header>
    <section id="about"><h2>About</h2><p>I’m Prince, a student and developer focused on building practical web projects for real users and clients.</p></section>
    <section id="skills"><h2>Skills</h2><div className="skills">{skills.map(s=><div className="skill" key={s.id}><div><b>{s.name}</b><small>{s.category}</small></div><span>{s.level}%</span><div className="bar"><i style={{width:s.level+"%"}}/></div></div>)}</div></section>
    <section id="projects"><h2>Projects</h2><div className="tabs">{cats.map(c=><button className={category===c?"active":""} onClick={()=>setCategory(c)} key={c}>{c}</button>)}</div><div className="grid">{shown.map(p=><article className="card" key={p.id}>{p.image_url&&<img src={p.image_url} alt=""/>}<p className="tag">{p.category}</p><h3>{p.title}</h3><p>{p.description}</p><small>{p.tech}</small><div className="links">{p.live_url&&<a href={p.live_url} target="_blank">Live ↗</a>}{p.github_url&&<a href={p.github_url} target="_blank">GitHub ↗</a>}</div></article>)}</div></section>
    <section id="contact"><h2>Contact</h2><form onSubmit={contact}><input name="name" placeholder="Your name" required/><input type="email" name="email" placeholder="Email" required/><textarea name="message" placeholder="Tell me about your project..." required/><button className="btn">Send Message</button>{sent&&<p className="ok">Message sent.</p>}{error&&<p className="err">{error}</p>}</form></section>
    <footer>© {new Date().getFullYear()} Prince Web Devs</footer>
  </div>
}

createRoot(document.getElementById("root")).render(<App/>);
