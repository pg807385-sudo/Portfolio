import React, {useEffect,useState} from "react";
import {createRoot} from "react-dom/client";
import "./style.css";

const api=async(p,o={})=>{const r=await fetch(p,{headers:{"Content-Type":"application/json",...(o.headers||{})},...o});const d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.error||"Request failed");return d};

function Admin(){
 const [logged,setLogged]=useState(false),[email,setEmail]=useState(""),[password,setPassword]=useState(""),[projects,setProjects]=useState([]),[skills,setSkills]=useState([]),[messages,setMessages]=useState([]),[err,setErr]=useState("");
 const [project,setProject]=useState({title:"",category:"Web",description:"",tech:"",live_url:"",github_url:"",image_url:"",featured:false});
 const [skill,setSkill]=useState({name:"",category:"Other",level:80});
 async function load(){try{await api("/api/admin/me");setLogged(true);setProjects(await api("/api/projects"));setSkills(await api("/api/skills"));setMessages(await api("/api/admin/messages"))}catch{}}
 useEffect(()=>{load()},[]);
 async function login(e){e.preventDefault();try{await api("/api/admin/login",{method:"POST",body:JSON.stringify({email,password})});setLogged(true);load()}catch(e){setErr(e.message)}}
 async function addProject(e){e.preventDefault();await api("/api/admin/projects",{method:"POST",body:JSON.stringify(project)});setProject({title:"",category:"Web",description:"",tech:"",live_url:"",github_url:"",image_url:"",featured:false});load()}
 async function delProject(id){await api("/api/admin/projects/"+id,{method:"DELETE"});load()}
 async function addSkill(e){e.preventDefault();await api("/api/admin/skills",{method:"POST",body:JSON.stringify(skill)});setSkill({name:"",category:"Other",level:80});load()}
 async function delSkill(id){await api("/api/admin/skills/"+id,{method:"DELETE"});load()}
 if(!logged)return <main className="admin"><h1>Admin Login</h1><form onSubmit={login}><input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}/><input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)}/><button className="btn">Login</button>{err&&<p className="err">{err}</p>}</form></main>;
 return <main className="admin"><div className="adminHead"><h1>Portfolio Admin</h1><button onClick={async()=>{await api("/api/admin/logout",{method:"POST"});location.reload()}}>Logout</button></div>
 <section><h2>Add Project</h2><form onSubmit={addProject}><input placeholder="Title" value={project.title} onChange={e=>setProject({...project,title:e.target.value})} required/><input placeholder="Category" value={project.category} onChange={e=>setProject({...project,category:e.target.value})}/><textarea placeholder="Description" value={project.description} onChange={e=>setProject({...project,description:e.target.value})} required/><input placeholder="Tech: React, PHP..." value={project.tech} onChange={e=>setProject({...project,tech:e.target.value})}/><input placeholder="Live URL" value={project.live_url} onChange={e=>setProject({...project,live_url:e.target.value})}/><input placeholder="GitHub URL" value={project.github_url} onChange={e=>setProject({...project,github_url:e.target.value})}/><input placeholder="Image URL" value={project.image_url} onChange={e=>setProject({...project,image_url:e.target.value})}/><label><input type="checkbox" checked={project.featured} onChange={e=>setProject({...project,featured:e.target.checked})}/> Featured</label><button className="btn">Add Project</button></form></section>
 <section><h2>Projects</h2>{projects.map(p=><div className="row" key={p.id}><b>{p.title}</b><button onClick={()=>delProject(p.id)}>Delete</button></div>)}</section>
 <section><h2>Add Skill</h2><form onSubmit={addSkill}><input placeholder="Skill" value={skill.name} onChange={e=>setSkill({...skill,name:e.target.value})} required/><input placeholder="Category" value={skill.category} onChange={e=>setSkill({...skill,category:e.target.value})}/><input type="number" min="0" max="100" value={skill.level} onChange={e=>setSkill({...skill,level:e.target.value})}/><button className="btn">Add Skill</button></form></section>
 <section><h2>Skills</h2>{skills.map(s=><div className="row" key={s.id}><span>{s.name} — {s.level}%</span><button onClick={()=>delSkill(s.id)}>Delete</button></div>)}</section>
 <section><h2>Messages</h2>{messages.map(m=><div className="message" key={m.id}><b>{m.name}</b> · {m.email}<p>{m.message}</p><small>{m.created_at}</small></div>)}</section>
 </main>
}
createRoot(document.getElementById("root")).render(<Admin/>);
