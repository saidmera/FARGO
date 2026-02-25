
import React, { useState, useEffect, useRef } from 'react';
import { 
  Package, Truck, Navigation, MapPin, TrendingUp, AlertCircle, CheckCircle, 
  Info, Clock, ChevronRight, History, Plus, Map as MapIcon, X, User, Zap, 
  Wallet, Phone, MessageSquare, Mic, Send, ArrowLeft, MoreHorizontal, Play,
  Weight, Ruler, Star, Filter, Bell, Settings, Container, MicOff, Volume2, PhoneOff
} from 'lucide-react';
import { Order, OrderStatus, ItemCategory, Location, UserRole, VehicleType, DriverOffer } from './types';
import { MapMock } from './components/MapMock';
import { getLogisticsAdvice } from './services/geminiService';

const MOCK_DRIVERS: DriverOffer[] = [
  { id: 'd1', driverName: 'Ahmed Transport', driverRating: 4.9, vehicleType: 'TRUCK', price: 250, etaMinutes: 8 },
  { id: 'd2', driverName: 'Yassine Express', driverRating: 4.7, vehicleType: 'VAN', price: 180, etaMinutes: 5 },
  { id: 'd3', driverName: 'CargoPro', driverRating: 5.0, vehicleType: 'HEAVY', price: 450, etaMinutes: 15 },
];

export default function App() {
  const [role, setRole] = useState<UserRole>('CLIENT');
  const [step, setStep] = useState<OrderStatus>(OrderStatus.IDLE);
  
  // Client States
  const [itemType, setItemType] = useState('');
  const [category, setCategory] = useState<ItemCategory>('Furniture');
  const [weight, setWeight] = useState<number>(0);
  const [vehicle, setVehicle] = useState<VehicleType>('VAN');
  const [pickupLocation, setPickupLocation] = useState<Location | null>(null);
  const [destination, setDestination] = useState('');
  const [destCoords, setDestCoords] = useState<{lat: number, lng: number} | null>(null);
  const [suggestedPrice, setSuggestedPrice] = useState(0);
  const [offers, setOffers] = useState<DriverOffer[]>([]);
  const [activeOffer, setActiveOffer] = useState<DriverOffer | null>(null);

  // Driver States
  const [isOnline, setIsOnline] = useState(true);
  const [availableJobs, setAvailableJobs] = useState<Order[]>([]);
  const [counterPrice, setCounterPrice] = useState<number>(0);

  // Common UI States
  const [showChat, setShowChat] = useState(false);
  const [showCall, setShowCall] = useState(false);
  const [callMuted, setCallMuted] = useState(false);
  const [callSpeaker, setCallSpeaker] = useState(false);
  const [callSeconds, setCallSeconds] = useState(0);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMsg, setInputMsg] = useState('');
  const [eta, setEta] = useState(15);
  const [driverPos, setDriverPos] = useState<Location | null>(null);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setPickupLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, address: 'Current Location' });
      });
    }
  }, []);

  // Simulate incoming offers for Client
  useEffect(() => {
    if (step === OrderStatus.SEARCHING) {
      const timer = setTimeout(() => {
        setOffers(MOCK_DRIVERS);
        setStep(OrderStatus.NEGOTIATING);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // Simulate tracking
  useEffect(() => {
    if (step === OrderStatus.ACCEPTED && pickupLocation) {
      const interval = setInterval(() => {
        setDriverPos(prev => {
          if (!prev) return { lat: pickupLocation.lat + 0.005, lng: pickupLocation.lng + 0.005, address: 'Moving' };
          return { lat: prev.lat - 0.0001, lng: prev.lng - 0.0001, address: 'En Route' };
        });
        setEta(e => Math.max(1, e - 1));
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [step, pickupLocation]);

  // Call timer logic
  useEffect(() => {
    let interval: any;
    if (showCall) {
      interval = setInterval(() => {
        setCallSeconds(s => s + 1);
      }, 1000);
    } else {
      setCallSeconds(0);
    }
    return () => clearInterval(interval);
  }, [showCall]);

  const handleCreateRequest = () => {
    if (!itemType || !destCoords) return;
    setStep(OrderStatus.SEARCHING);
  };

  const handleAcceptOffer = (offer: DriverOffer) => {
    setActiveOffer(offer);
    setStep(OrderStatus.ACCEPTED);
  };

  const handleReset = () => {
    setStep(OrderStatus.IDLE);
    setItemType('');
    setDestination('');
    setDestCoords(null);
    setOffers([]);
    setActiveOffer(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#F4F4F4] text-[#1A1A1A] max-w-md mx-auto relative font-['Outfit']">
      
      {/* Dynamic Header */}
      <header className="sticky top-0 z-[100] px-6 py-4 glass border-b border-white flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2" onClick={handleReset}>
          <div className="bg-[#F7FF00] p-1.5 rounded-xl border border-black/5 shadow-inner">
            <Truck className="w-6 h-6 text-black" />
          </div>
          <span className="text-2xl font-black italic tracking-tighter">CargoSwift</span>
        </div>
        <button 
          onClick={() => { setRole(role === 'CLIENT' ? 'DRIVER' : 'CLIENT'); handleReset(); }}
          className="bg-black text-[#F7FF00] text-[10px] font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-lg active:scale-95 transition-all"
        >
          {role} MODE
        </button>
      </header>

      <main className="px-5 pb-32 pt-4">
        {/* --- CLIENT VIEW --- */}
        {role === 'CLIENT' && (
          <div className="space-y-6 animate-in slide-in-from-bottom">
            {step === OrderStatus.IDLE && (
              <div className="space-y-6">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-4 border-white overflow-hidden relative">
                   <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#F7FF00]/10 rounded-full blur-3xl"></div>
                   <h2 className="text-4xl font-black leading-none italic mb-2">WHERE TO?</h2>
                   <p className="text-xs font-bold text-slate-400 mb-6">Transparent pricing for every shipment.</p>
                   
                   <MapMock pickup={pickupLocation || undefined} />
                   
                   <button onClick={() => setStep(OrderStatus.CONFIGURING)} className="w-full mt-6 bg-[#F7FF00] text-black py-5 rounded-3xl font-black text-xl shadow-[0_10px_30px_rgba(247,255,0,0.3)] border-2 border-black/5 active:scale-95 transition-all">
                     Request Pickup
                   </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-white p-5 rounded-3xl border border-white shadow-sm">
                      <History className="w-5 h-5 text-slate-400 mb-2" />
                      <p className="text-[10px] font-black uppercase text-slate-400">Past Jobs</p>
                      <p className="text-xl font-black">12 Total</p>
                   </div>
                   <div className="bg-white p-5 rounded-3xl border border-white shadow-sm">
                      <Wallet className="w-5 h-5 text-emerald-500 mb-2" />
                      <p className="text-[10px] font-black uppercase text-slate-400">Balance</p>
                      <p className="text-xl font-black">450 DH</p>
                   </div>
                </div>
              </div>
            )}

            {step === OrderStatus.CONFIGURING && (
              <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl space-y-5 animate-in slide-in-from-right">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-black italic">Cargo Details</h3>
                  <button onClick={handleReset} className="p-2 bg-slate-100 rounded-full"><X className="w-4 h-4" /></button>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <Package className="absolute left-4 top-4 text-slate-400 w-5 h-5" />
                    <input 
                      type="text" placeholder="What are you sending?" 
                      className="w-full bg-slate-50 border-2 border-slate-100 p-4 pl-12 rounded-2xl font-bold text-sm focus:border-[#F7FF00] outline-none transition-all"
                      value={itemType} onChange={e => setItemType(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {(['VAN', 'TRUCK', 'HEAVY'] as VehicleType[]).map(v => (
                      <button 
                        key={v} onClick={() => setVehicle(v)}
                        className={`p-3 rounded-2xl border-2 flex flex-col items-center transition-all ${vehicle === v ? 'border-[#F7FF00] bg-[#F7FF00]/5' : 'border-slate-100 bg-slate-50'}`}
                      >
                        {v === 'VAN' ? <Truck className="w-6 h-6" /> : v === 'TRUCK' ? <Container className="w-6 h-6" /> : <Zap className="w-6 h-6" />}
                        <span className="text-[9px] font-black mt-1">{v}</span>
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-1 bg-slate-50 p-4 rounded-2xl border-2 border-slate-100 flex items-center gap-3">
                      <Weight className="w-5 h-5 text-slate-400" />
                      <input type="number" placeholder="Weight (kg)" className="bg-transparent w-full font-bold text-sm outline-none" onChange={e => setWeight(Number(e.target.value))} />
                    </div>
                    <div className="flex-1 bg-slate-50 p-4 rounded-2xl border-2 border-slate-100 flex items-center gap-3">
                      <Wallet className="w-5 h-5 text-slate-400" />
                      <input type="number" placeholder="Offer (DH)" className="bg-transparent w-full font-bold text-sm outline-none" onChange={e => setSuggestedPrice(Number(e.target.value))} />
                    </div>
                  </div>

                  <MapMock pickup={pickupLocation || undefined} onSelectDestination={(lat, lng, addr) => { setDestCoords({lat, lng}); setDestination(addr); }} interactive />
                  
                  {destination && (
                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-center gap-3">
                      <MapPin className="text-blue-500 w-5 h-5" />
                      <p className="text-xs font-bold text-blue-900 truncate">{destination}</p>
                    </div>
                  )}
                </div>

                <button onClick={handleCreateRequest} className="w-full bg-black text-[#F7FF00] py-5 rounded-[2rem] font-black text-xl shadow-xl active:scale-95 transition-all">
                  Broadcast Request
                </button>
              </div>
            )}

            {step === OrderStatus.SEARCHING && (
              <div className="flex flex-col items-center py-20 animate-in zoom-in">
                <div className="relative">
                  <div className="w-32 h-32 border-8 border-slate-200 border-t-[#F7FF00] rounded-full animate-spin"></div>
                  <Truck className="absolute inset-0 m-auto w-10 h-10 text-black" />
                </div>
                <h3 className="text-3xl font-black italic mt-10">SEARCHING...</h3>
                <p className="text-slate-400 font-bold mt-2">Drivers are reviewing your cargo.</p>
              </div>
            )}

            {step === OrderStatus.NEGOTIATING && (
              <div className="space-y-4 animate-in slide-in-from-right">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-2xl font-black italic">Driver Offers</h3>
                  <span className="bg-[#F7FF00] text-black text-[10px] font-black px-3 py-1 rounded-full">{offers.length} NEARBY</span>
                </div>
                {offers.map(o => (
                  <div key={o.id} className="bg-white p-5 rounded-[2rem] shadow-lg border-2 border-white flex justify-between items-center group active:scale-95 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center relative overflow-hidden">
                        <User className="w-8 h-8 text-slate-300" />
                        <div className="absolute bottom-0 right-0 bg-emerald-500 w-3 h-3 border-2 border-white rounded-full"></div>
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900">{o.driverName}</h4>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-orange-400 fill-current" />
                          <span className="text-[10px] font-black text-slate-500">{o.driverRating} • {o.etaMinutes} min away</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <p className="text-2xl font-black leading-none">{o.price} DH</p>
                      <button onClick={() => handleAcceptOffer(o)} className="bg-black text-[#F7FF00] text-[10px] font-black px-4 py-2 rounded-xl">ACCEPT</button>
                    </div>
                  </div>
                ))}
                <button onClick={handleReset} className="w-full py-4 text-slate-400 font-bold text-xs">CANCEL REQUEST</button>
              </div>
            )}

            {step === OrderStatus.ACCEPTED && activeOffer && (
              <div className="space-y-6 animate-in zoom-in">
                <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border-4 border-white relative overflow-hidden">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center font-black text-2xl">
                        {activeOffer.driverName[0]}
                      </div>
                      <div>
                        <h4 className="text-xl font-black">{activeOffer.driverName}</h4>
                        <p className="text-xs font-bold text-blue-600 uppercase tracking-tighter">Verified {activeOffer.vehicleType}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => setShowCall(true)} className="p-4 bg-slate-100 rounded-2xl active:scale-90 transition-all shadow-sm border border-black/5 hover:bg-slate-200"><Phone className="w-5 h-5 text-emerald-600" /></button>
                       <button onClick={() => setShowChat(true)} className="p-4 bg-[#F7FF00] rounded-2xl active:scale-90 transition-all relative shadow-sm border border-black/5 hover:bg-[#e6ee00]">
                         <MessageSquare className="w-5 h-5 text-black" />
                         <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
                       </button>
                    </div>
                  </div>

                  <MapMock pickup={pickupLocation || undefined} destination={destCoords || undefined} driverLocation={driverPos || undefined} driverVehicle={activeOffer.vehicleType} showRoute />
                  
                  <div className="mt-6 flex justify-between items-center">
                    <div className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-black text-slate-400 uppercase">Estimated</p>
                      <p className="text-lg font-black">{eta} MIN</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase">Final Price</p>
                      <p className="text-3xl font-black text-slate-900">{activeOffer.price} DH</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-white shadow-sm flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"><CheckCircle className="w-6 h-6 text-blue-600" /></div>
                      <div>
                         <p className="text-sm font-black italic">Cargo Secured</p>
                         <p className="text-[10px] font-bold text-slate-400">Driver has confirmed loading.</p>
                      </div>
                   </div>
                   <button className="text-[10px] font-black text-slate-400 uppercase border-b border-dotted">Report Issue</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- DRIVER VIEW --- */}
        {role === 'DRIVER' && (
          <div className="space-y-6 animate-in slide-in-from-top">
             <div className="bg-black text-white p-6 rounded-[2.5rem] flex justify-between items-center shadow-2xl">
                <div>
                   <h3 className="text-2xl font-black italic">Go Online</h3>
                   <p className="text-xs font-bold text-slate-400">Visible to 25 nearby jobs</p>
                </div>
                <button 
                  onClick={() => setIsOnline(!isOnline)}
                  className={`w-16 h-8 rounded-full relative transition-all ${isOnline ? 'bg-emerald-500' : 'bg-slate-700'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${isOnline ? 'left-9' : 'left-1'}`}></div>
                </button>
             </div>

             {isOnline ? (
               <div className="space-y-4">
                  <div className="flex justify-between items-center px-2">
                     <h4 className="text-lg font-black italic">Available Jobs</h4>
                     <button className="p-2 bg-white rounded-xl shadow-sm"><Filter className="w-4 h-4" /></button>
                  </div>

                  <div className="bg-white p-5 rounded-[2rem] shadow-lg border-2 border-white space-y-4">
                     <div className="flex justify-between">
                        <div className="flex gap-3">
                           <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center"><Package className="w-6 h-6 text-blue-600" /></div>
                           <div>
                              <p className="text-sm font-black">Industrial Pumps</p>
                              <p className="text-[10px] font-bold text-slate-400">Construction • 2.4 Tons</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-xl font-black">1500 DH</p>
                           <p className="text-[9px] font-black text-emerald-500 uppercase">Cash Trip</p>
                        </div>
                     </div>
                     <div className="space-y-2 py-2 border-y border-slate-50">
                        <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div><p className="text-[10px] font-bold text-slate-600">Route de l'Aéroport, Casablanca</p></div>
                        <div className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div><p className="text-[10px] font-bold text-slate-600">Technopark Side, Casablanca</p></div>
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                        <button className="bg-slate-100 py-3 rounded-2xl text-[11px] font-black">Counter Offer</button>
                        <button className="bg-[#F7FF00] py-3 rounded-2xl text-[11px] font-black shadow-lg">Accept for 1500</button>
                     </div>
                  </div>

                  <div className="bg-white/50 p-10 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center">
                     <Bell className="w-8 h-8 text-slate-300 mb-4" />
                     <p className="text-xs font-black text-slate-400 text-center">Looking for more shipments in your area...</p>
                  </div>
               </div>
             ) : (
               <div className="text-center py-20">
                  <div className="w-20 h-20 bg-slate-200 rounded-full mx-auto mb-6 flex items-center justify-center"><Settings className="w-10 h-10 text-slate-400" /></div>
                  <h4 className="text-xl font-black italic">Offline Mode</h4>
                  <p className="text-xs font-bold text-slate-400 mt-2">Go online to see delivery requests.</p>
               </div>
             )}
          </div>
        )}
      </main>

      {/* Floating Bottom Navigation */}
      <footer className="fixed bottom-6 left-6 right-6 z-[1000]">
        <div className="glass border-2 border-white rounded-[2.5rem] shadow-2xl p-2.5 flex justify-between items-center">
          <button className="flex-1 flex flex-col items-center gap-1 py-3 rounded-3xl bg-[#F7FF00] text-black shadow-sm">
            <MapIcon className="w-6 h-6" strokeWidth={3} />
            <span className="text-[9px] font-black uppercase tracking-tight">Market</span>
          </button>
          <button className="flex-1 flex flex-col items-center gap-1 py-3 text-slate-400">
            <History className="w-6 h-6" />
            <span className="text-[9px] font-black uppercase tracking-tight">Trips</span>
          </button>
          <button className="flex-1 flex flex-col items-center gap-1 py-3 text-slate-400">
            <Wallet className="w-6 h-6" />
            <span className="text-[9px] font-black uppercase tracking-tight">Wallet</span>
          </button>
          <button className="flex-1 flex flex-col items-center gap-1 py-3 text-slate-400">
            <User className="w-6 h-6" />
            <span className="text-[9px] font-black uppercase tracking-tight">Profile</span>
          </button>
        </div>
      </footer>

      {/* VOIP Call Overlay */}
      {showCall && (
        <div className="fixed inset-0 z-[3000] bg-black/90 backdrop-blur-xl animate-in fade-in duration-300 flex flex-col items-center justify-between py-24 px-8 text-white">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center border-4 border-[#F7FF00]/50 relative overflow-hidden">
               {activeOffer ? (
                 <span className="text-5xl font-black italic">{activeOffer.driverName[0]}</span>
               ) : (
                 <User className="w-16 h-16 text-slate-400" />
               )}
               <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20"></div>
            </div>
            <div className="text-center">
              <h2 className="text-3xl font-black italic tracking-tight">{activeOffer?.driverName || 'Contacting...'}</h2>
              <p className="text-[#F7FF00] font-black uppercase text-[10px] tracking-widest mt-1">VOIP Secure Channel</p>
              <p className="text-slate-400 font-mono mt-2 text-xl">{formatTime(callSeconds)}</p>
            </div>
          </div>

          <div className="w-full flex justify-center gap-8">
            <button 
              onClick={() => setCallMuted(!callMuted)}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${callMuted ? 'bg-[#F7FF00] text-black' : 'bg-white/10 text-white border border-white/20'}`}
            >
              {callMuted ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
            </button>
            <button 
              onClick={() => setShowCall(false)}
              className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.4)] active:scale-90 transition-all"
            >
              <PhoneOff className="w-9 h-9 text-white" fill="white" />
            </button>
            <button 
              onClick={() => setCallSpeaker(!callSpeaker)}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${callSpeaker ? 'bg-blue-500 text-white' : 'bg-white/10 text-white border border-white/20'}`}
            >
              <Volume2 className="w-7 h-7" />
            </button>
          </div>
          
          <div className="flex items-center gap-2 text-slate-500">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-widest">End-to-End Encrypted</span>
          </div>
        </div>
      )}

      {/* Chat Overlay */}
      {showChat && (
        <div className="fixed inset-0 z-[2000] bg-white animate-in slide-in-from-right flex flex-col">
          <div className="p-6 border-b flex items-center gap-4">
            <button onClick={() => setShowChat(false)} className="p-2 hover:bg-slate-50 rounded-xl transition-all"><ArrowLeft /></button>
            <div className="flex-grow">
               <h3 className="font-black italic">{activeOffer?.driverName || 'Chat'}</h3>
               <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">Live Chat Secure</p>
            </div>
            <button className="p-2 text-slate-400"><MoreHorizontal /></button>
          </div>
          <div className="flex-grow p-6 flex flex-col gap-4 overflow-y-auto bg-slate-50/50">
             <div className="self-start bg-white p-4 rounded-2xl rounded-tl-none shadow-sm max-w-[80%] border border-slate-100">
                <p className="text-sm font-medium">Hello! I'm nearby and have the equipment to handle your cargo safely.</p>
                <span className="text-[8px] text-slate-400 mt-1 block">10:42 AM</span>
             </div>
             <div className="self-end bg-black text-white p-4 rounded-2xl rounded-tr-none shadow-md max-w-[80%]">
                <p className="text-sm font-medium">Great, I'm at the pickup point now. Please let me know when you arrive.</p>
                <span className="text-[8px] text-white/50 mt-1 block">10:43 AM</span>
             </div>
             <div className="flex-grow flex items-center justify-center text-slate-300 font-bold italic text-xs">
                End of message history
             </div>
          </div>
          <div className="p-4 border-t glass flex gap-3 items-center">
             <button className="p-3 text-slate-400 hover:bg-slate-100 rounded-xl transition-all"><Mic className="w-5 h-5" /></button>
             <input 
              type="text" 
              placeholder="Message..." 
              className="flex-grow bg-slate-100 p-4 rounded-2xl outline-none font-medium text-sm focus:ring-2 ring-[#F7FF00]/50 transition-all" 
              value={inputMsg}
              onChange={e => setInputMsg(e.target.value)}
             />
             <button className="bg-[#F7FF00] p-4 rounded-2xl shadow-md active:scale-95 transition-all text-black"><Send className="w-5 h-5" /></button>
          </div>
        </div>
      )}
    </div>
  );
}
