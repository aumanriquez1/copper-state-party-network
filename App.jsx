import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarDays, CheckCircle2, Clock3, DollarSign, MapPin, Phone, Truck, Users, Flame, Navigation, Search, TimerReset, Star } from "lucide-react";

/*
Copper State Party Network
FINAL PRODUCT STYLE PROTOTYPE

Core System
Customer request → Dispatch → Vendor accepts → Job locked → Payment → Completion
*/

const cities = ["Phoenix","Mesa","Chandler","Gilbert","Glendale","Tempe","Scottsdale"];
const extras = ["tablecloths","tent","bounce house","lights","coolers"];

const initialVendors = [
  {
    id:1,
    name:"Mesa Backyard Rentals",
    city:"Mesa",
    phone:"(480)555‑2011",
    available:true,
    products:["chairs","tables","tablecloths","tent"],
    rating:4.8,
    travelCities:["Mesa","Tempe","Gilbert"],
    location:{ x: 72, y: 58 },
    schedule:[
      { date:"2026-03-12", start:"08:00", end:"11:00", label:"Setup" },
      { date:"2026-03-12", start:"15:00", end:"18:00", label:"Pickup" },
      { date:"2026-03-13", start:"10:00", end:"14:00", label:"Birthday" }
    ]
  },
  {
    id:2,
    name:"Chandler Event Setup",
    city:"Chandler",
    phone:"(480)555‑2044",
    available:true,
    products:["chairs","tables","bounce house"],
    rating:4.6,
    travelCities:["Chandler","Gilbert","Tempe"],
    location:{ x: 74, y: 72 },
    schedule:[
      { date:"2026-03-12", start:"09:00", end:"12:00", label:"School Event" },
      { date:"2026-03-12", start:"13:00", end:"16:00", label:"Baby Shower" }
    ]
  },
  {
    id:3,
    name:"Phoenix Party Crew",
    city:"Phoenix",
    phone:"(602)555‑1881",
    available:true,
    products:["chairs","tables","tent"],
    rating:4.7,
    travelCities:["Phoenix","Glendale","Scottsdale","Tempe"],
    location:{ x: 48, y: 38 },
    schedule:[
      { date:"2026-03-12", start:"07:00", end:"10:00", label:"Morning Setup" },
      { date:"2026-03-12", start:"17:00", end:"20:00", label:"Evening Pickup" }
    ]
  }
];

const initialRequests = [
  {
    id: 91001,
    customer:"Hot Lead – Mesa Church",
    phone:"(480)555-7777",
    city:"Mesa",
    address:"123 E Main St, Mesa, AZ",
    chairs:50,
    tables:6,
    extras:["tablecloths"],
    date:"2026-03-12",
    notes:"Need quick turnaround for evening event.",
    status:"open",
    assigned:null,
    vendorPrice:0,
    customerPrice:0,
    deposit:false,
    hotRequest:true
  }
];

function money(v){
  return new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(v||0);
}

function statusColor(status){
  switch(status){
    case"open":return"bg-slate-100 text-slate-800";
    case"broadcast":return"bg-yellow-100 text-yellow-800";
    case"booked":return"bg-green-100 text-green-800";
    case"completed":return"bg-blue-100 text-blue-800";
    case"hot":return"bg-red-100 text-red-800";
    default:return"bg-slate-100";
  }
}

const timeSlots = ["07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00"];

function timeToIndex(time){
  return timeSlots.indexOf(time);
}

function vendorHasCoverage(vendor, city){
  return vendor.city === city || vendor.travelCities?.includes(city);
}

function vendorHasNeededProducts(vendor, request){
  const needs = [];
  if(request.chairs > 0) needs.push("chairs");
  if(request.tables > 0) needs.push("tables");
  (request.extras || []).forEach(item => needs.push(item));
  return needs.every(item => vendor.products.includes(item) || extras.includes(item) === false);
}

function getOpenBlocks(vendor, date){
  const blocks = vendor.schedule?.filter(s => s.date === date) || [];
  return timeSlots.map(slot => {
    const busy = blocks.some(block => timeToIndex(slot) >= timeToIndex(block.start) && timeToIndex(slot) < timeToIndex(block.end));
    return { slot, busy };
  });
}

function vendorAvailabilityScore(vendor, request){
  const openBlocks = getOpenBlocks(vendor, request.date).filter(b => !b.busy).length;
  const cityBonus = vendor.city === request.city ? 2 : 1;
  const ratingBonus = vendor.rating || 0;
  return openBlocks + cityBonus + ratingBonus;
}

export default function CopperStatePartyNetwork(){

const [vendors,setVendors]=useState(initialVendors);
const [requests,setRequests]=useState(initialRequests);
const [vendorView,setVendorView]=useState("1");

const [form,setForm]=useState({
name:"",
phone:"",
city:"Phoenix",
address:"",
date:"2026-03-12",
chairs:"",
tables:"",
extras:[],
notes:"",
hotRequest:false
});

const [selectedDate,setSelectedDate]=useState("2026-03-12");
const [mapCityFilter,setMapCityFilter]=useState("All");
const [hotSearch,setHotSearch]=useState("");

const currentVendor=vendors.find(v=>String(v.id)===vendorView);

const submitRequest=()=>{

if(!form.name||!form.phone||!form.address||!form.date)return;

const id=Date.now();

const newReq={

id,
customer:form.name,
phone:form.phone,
city:form.city,
address:form.address,
chairs:Number(form.chairs||0),
tables:Number(form.tables||0),
extras:form.extras,
date:form.date,
notes:form.notes,
status:form.hotRequest?"hot":"open",
assigned:null,
vendorPrice:0,
customerPrice:0,
deposit:false,
hotRequest:form.hotRequest

};

setRequests(r=>[newReq,...r]);

setForm({name:"",phone:"",city:"Phoenix",address:"",date:selectedDate,chairs:"",tables:"",extras:[],notes:"",hotRequest:false});

};

const dispatchRequest=(id)=>{
setRequests(r=>r.map(req=>req.id===id?{...req,status:req.hotRequest?"hot":"broadcast"}:req));
};

const vendorAccept=(req)=>{

if(req.assigned)return;

const vendorQuote=
req.chairs*1+
req.tables*8+
(req.extras.includes("tent")?80:0)+
(req.extras.includes("bounce house")?120:0)+40;

const customerQuote=Math.round(vendorQuote*1.35);

setRequests(r=>r.map(x=>

x.id===req.id
?{...x,assigned:currentVendor.id,status:"booked",vendorPrice:vendorQuote,customerPrice:customerQuote}
:x

));
};

const completeJob=(id)=>{
setRequests(r=>r.map(x=>x.id===id?{...x,status:"completed"}:x));
};

const openRequests=requests.filter(r=>!r.assigned&&(r.status==="open"||r.status==="broadcast"));

const vendorRequests=openRequests.filter(r=>
  vendorHasCoverage(currentVendor, r.city) &&
  vendorHasNeededProducts(currentVendor, r)
);

const vendorJobs=requests.filter(r=>r.assigned===currentVendor.id);

const hotRequests = requests.filter(r => (r.hotRequest || r.status === "hot") && !r.assigned);

const mapVendors = vendors.filter(v => mapCityFilter === "All" ? true : vendorHasCoverage(v, mapCityFilter));

const recommendedHotMatches = hotRequests
  .filter(r => hotSearch ? r.city.toLowerCase().includes(hotSearch.toLowerCase()) || r.customer.toLowerCase().includes(hotSearch.toLowerCase()) : true)
  .map(request => ({
    request,
    vendors: [...vendors]
      .filter(v => vendorHasCoverage(v, request.city) && vendorHasNeededProducts(v, request))
      .sort((a,b) => vendorAvailabilityScore(b, request) - vendorAvailabilityScore(a, request))
  }));

const revenue=requests.reduce((sum,r)=>sum+r.customerPrice,0);
const vendorCost=requests.reduce((sum,r)=>sum+r.vendorPrice,0);

const profit=revenue-vendorCost;

return(

<div className="min-h-screen bg-slate-50 p-6">

<div className="max-w-7xl mx-auto space-y-6">

<header className="bg-white p-6 rounded-2xl border flex justify-between items-center">

<div className="flex items-center gap-3">
<Logo/>
<div>
<p className="text-sm text-slate-500">Copper State Party Network</p>
<h1 className="text-2xl font-bold">Arizona Party Rental Broker Network</h1>
</div>
</div>

<div className="flex gap-6">
<Metric label="Requests" value={requests.length} icon={<Users size={16}/>}/>
<Metric label="Booked" value={requests.filter(r=>r.status==='booked').length} icon={<CheckCircle2 size={16}/>}/>
<Metric label="Profit" value={money(profit)} icon={<DollarSign size={16}/>}/>
<Metric label="Hot" value={hotRequests.length} icon={<Flame size={16}/>}/>
</div>

</header>

<Tabs defaultValue="customer">

<TabsList className="grid grid-cols-4">
<TabsTrigger value="customer">Customer</TabsTrigger>
<TabsTrigger value="vendor">Vendor</TabsTrigger>
<TabsTrigger value="admin">Admin</TabsTrigger>
<TabsTrigger value="ops">Map & Calendar</TabsTrigger>
</TabsList>

<TabsContent value="customer">

<Card>
<CardHeader><CardTitle>Submit Rental Request</CardTitle></CardHeader>
<CardContent className="space-y-4">

<Input placeholder="Customer name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
<Input placeholder="Phone" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/>

<Select value={form.city} onValueChange={v=>setForm({...form,city:v})}>
<SelectTrigger><SelectValue/></SelectTrigger>
<SelectContent>{cities.map(c=><SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
</Select>

<Input placeholder="Address" value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/>
<Input type="date" value={form.date} onChange={e=>{setForm({...form,date:e.target.value});setSelectedDate(e.target.value);}}/>

<Input type="number" placeholder="Chairs" value={form.chairs} onChange={e=>setForm({...form,chairs:e.target.value})}/>
<Input type="number" placeholder="Tables" value={form.tables} onChange={e=>setForm({...form,tables:e.target.value})}/>

<div className="grid grid-cols-2 gap-2">
{extras.map(x=>{
const checked=form.extras.includes(x);
return(
<label key={x} className="flex gap-2">
<Checkbox
checked={checked}
onCheckedChange={()=>{
setForm({...form,extras:checked?form.extras.filter(e=>e!==x):[...form.extras,x]});
}}
/>{x}
</label>
);
})}
</div>

<label className="flex items-center gap-2 text-sm font-medium">
<Checkbox checked={form.hotRequest} onCheckedChange={(checked)=>setForm({...form,hotRequest:!!checked})}/>
Mark as Hot Request
</label>

<Textarea placeholder="Notes" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/>

<Button onClick={submitRequest}>{form.hotRequest ? "Create Hot Request" : "Create Request"}</Button>

</CardContent>
</Card>

</TabsContent>

<TabsContent value="vendor">

<Card>
<CardHeader><CardTitle>Vendor Dashboard</CardTitle></CardHeader>
<CardContent className="space-y-4">

<Select value={vendorView} onValueChange={setVendorView}>
<SelectTrigger><SelectValue/></SelectTrigger>
<SelectContent>{vendors.map(v=><SelectItem key={v.id} value={String(v.id)}>{v.name}</SelectItem>)}</SelectContent>
</Select>

<h3 className="font-semibold">Incoming Requests</h3>

{vendorRequests.map(req=>(

<div key={req.id} className="border p-3 rounded-xl">

<p className="font-medium">{req.customer}</p>

<div className="text-sm text-slate-600 flex gap-3">
<span><CalendarDays size={14}/> {req.date}</span>
<span><MapPin size={14}/> {req.city}</span>
</div>

<p className="text-sm">{req.chairs} chairs • {req.tables} tables</p>

<Button onClick={()=>vendorAccept(req)}>Accept Job</Button>

</div>

))}

<h3 className="font-semibold mt-6">My Jobs</h3>

{vendorJobs.map(job=>(

<div key={job.id} className="border p-3 rounded-xl">

<p className="font-medium">{job.customer}</p>

<Badge className={statusColor(job.status)}>{job.status}</Badge>

<p className="text-sm">Vendor payout {money(job.vendorPrice)}</p>

{job.status!=='completed'&&(
<Button onClick={()=>completeJob(job.id)}>Complete Job</Button>
)}

</div>

))}

</CardContent>
</Card>

</TabsContent>

<TabsContent value="admin">

<Card>
<CardHeader><CardTitle>Admin Dispatch Board</CardTitle></CardHeader>
<CardContent className="space-y-4">

{requests.map(r=>(

<div key={r.id} className="border rounded-xl p-3 flex justify-between items-start gap-4">

<div>
<p className="font-medium flex items-center gap-2">{r.customer}{r.hotRequest && <Badge className="bg-red-100 text-red-800"><Flame className="w-3 h-3 mr-1"/>Hot Request</Badge>}</p>
<p className="text-sm">{r.city}</p>
<p className="text-xs text-slate-500">{r.date} • {r.address}</p>
<Badge className={statusColor(r.status)}>{r.status}</Badge>
</div>

<div className="flex gap-2">

{(r.status==='open' || r.status==='hot')&&(
<Button onClick={()=>dispatchRequest(r.id)}>{r.hotRequest ? "Dispatch Hot" : "Dispatch"}</Button>
)}

</div>

</div>

))}

</CardContent>
</Card>

</TabsContent>

<TabsContent value="ops">
<div className="grid grid-cols-1 xl:grid-cols-[1.1fr,0.9fr] gap-6">
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2"><Navigation size={18}/>Vendor Coverage Map</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="flex gap-3 items-center">
        <Select value={mapCityFilter} onValueChange={setMapCityFilter}>
          <SelectTrigger className="w-56"><SelectValue/></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Areas</SelectItem>
            {cities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input value={selectedDate} type="date" onChange={e=>setSelectedDate(e.target.value)} className="w-48"/>
      </div>

      <div className="relative w-full h-[380px] rounded-2xl border bg-gradient-to-br from-amber-50 to-orange-100 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path d="M24 7 L67 14 L77 37 L71 80 L43 90 L18 66 L21 41 Z" fill="none" stroke="#b87333" strokeWidth="2" />
          </svg>
        </div>
        <div className="absolute top-4 left-4 bg-white/90 rounded-xl px-3 py-2 text-sm shadow-sm border">Phoenix Metro Coverage</div>
        {mapVendors.map(vendor => {
          const openCount = getOpenBlocks(vendor, selectedDate).filter(b => !b.busy).length;
          return (
            <div key={vendor.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${vendor.location.x}%`, top: `${vendor.location.y}%` }}>
              <div className="group relative">
                <button className="w-5 h-5 rounded-full border-2 border-white shadow-lg bg-orange-600" />
                <div className="hidden group-hover:block absolute left-6 top-0 w-64 rounded-xl border bg-white p-3 shadow-xl z-20">
                  <p className="font-medium">{vendor.name}</p>
                  <p className="text-sm text-slate-600">{vendor.city} • {vendor.phone}</p>
                  <p className="text-xs text-slate-500 mt-1">Travels to: {vendor.travelCities.join(", ")}</p>
                  <div className="mt-2 flex items-center gap-2 text-sm"><Star className="w-4 h-4 text-amber-500"/>{vendor.rating} rating</div>
                  <div className="mt-2 text-sm">Open blocks on {selectedDate}: <span className="font-semibold">{openCount}</span></div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </CardContent>
  </Card>

  <div className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Clock3 size={18}/>Availability Blocks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {vendors.map(vendor => (
          <div key={vendor.id} className="rounded-xl border p-3 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{vendor.name}</p>
                <p className="text-xs text-slate-500">{vendor.city} • {vendor.travelCities.join(", ")}</p>
              </div>
              <Badge className={vendor.available ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-700"}>{vendor.available ? "Available" : "Offline"}</Badge>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center text-xs">
              {getOpenBlocks(vendor, selectedDate).map(block => (
                <div key={`${vendor.id}-${block.slot}`} className={`rounded-lg px-2 py-2 border ${block.busy ? "bg-slate-200 text-slate-500" : "bg-green-50 text-green-700 border-green-200"}`}>
                  <div>{block.slot}</div>
                  <div className="mt-1 font-medium">{block.busy ? "Busy" : "Open"}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Flame size={18}/>Hot Request Board</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3">
          <Input placeholder="Search hot requests" value={hotSearch} onChange={e=>setHotSearch(e.target.value)} />
          <Button variant="outline"><Search className="w-4 h-4 mr-2"/>Find</Button>
        </div>
        {recommendedHotMatches.length === 0 ? (
          <div className="rounded-xl border border-dashed p-4 text-sm text-slate-500">No open hot requests right now.</div>
        ) : recommendedHotMatches.map(({ request, vendors: matches }) => (
          <div key={request.id} className="rounded-xl border p-4 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold flex items-center gap-2">{request.customer}<Badge className="bg-red-100 text-red-800">Hot Request</Badge></p>
                <p className="text-sm text-slate-600">{request.city} • {request.date}</p>
                <p className="text-sm">{request.chairs} chairs • {request.tables} tables {request.extras.length ? `• ${request.extras.join(", ")}` : ""}</p>
              </div>
              <Button variant="outline"><TimerReset className="w-4 h-4 mr-2"/>Quick Dispatch</Button>
            </div>
            <div className="space-y-2">
              {matches.slice(0,3).map(match => {
                const openCount = getOpenBlocks(match, request.date).filter(b => !b.busy).length;
                return (
                  <div key={match.id} className="flex items-center justify-between rounded-lg bg-slate-50 border p-3">
                    <div>
                      <p className="font-medium">{match.name}</p>
                      <p className="text-xs text-slate-500">{match.city} • {match.phone}</p>
                      <p className="text-xs text-slate-500">Open blocks: {openCount} • Rating: {match.rating}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Call</Button>
                      <Button size="sm">Dispatch</Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  </div>
</div>
</TabsContent>

</Tabs>

</div>

</div>

);
}

function Metric({label,value,icon}){
return(
<div className="flex flex-col items-center">
<div className="flex items-center gap-1 text-sm">{icon}{label}</div>
<div className="font-semibold">{value}</div>
</div>
);
}

function Logo(){
return(
<svg width="36" height="36" viewBox="0 0 64 64" fill="none">
<path d="M18 6 L46 10 L52 24 L48 52 L28 58 L14 44 L16 26 Z" stroke="#b87333" strokeWidth="3"/>
<circle cx="32" cy="34" r="3" fill="#b87333"/>
<line x1="32" y1="34" x2="22" y2="24" stroke="#b87333" strokeWidth="2"/>
<line x1="32" y1="34" x2="42" y2="22" stroke="#b87333" strokeWidth="2"/>
</svg>
);
}
