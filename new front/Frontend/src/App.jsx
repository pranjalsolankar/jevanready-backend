import React, { useState, useEffect } from 'react';
import API_BASE_URL from './api';

export default function App() {
  // Restore user session on initial load
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('jevan_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentView, setCurrentView] = useState(() => {
    const saved = localStorage.getItem('jevan_user');
    if (!saved) return 'AUTH';
    const parsed = JSON.parse(saved);
    return parsed.role === 'student' ? 'STUDENT_BROWSE' : 'OWNER_DASHBOARD';
  });

  // Keep localStorage in sync with state
  const handleSetUser = (userData) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem('jevan_user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('jevan_user');
    }
  };

  const handleLogout = () => {
    handleSetUser(null);
    setCurrentView('AUTH');
  };

  // ==========================================
  // 1. AUTH / LOGIN & SIGNUP VIEW
  // ==========================================
  const AuthView = () => {
    const [roleTab, setRoleTab] = useState('student'); // 'student' or 'owner'
    const [isSignUp, setIsSignUp] = useState(false);  // false = Sign In, true = Create Account

    // Form inputs
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');

    const resetForm = () => {
      setFullName('');
      setEmail('');
      setPhone('');
      setPassword('');
    };

    const handleRoleTabChange = (role) => {
      setRoleTab(role);
      resetForm();
    };

    const handleAuthSubmit = async (e) => {
      e.preventDefault();
      
      const endpoint = isSignUp ? `${API_BASE_URL}/api/auth/register` : `${API_BASE_URL}/api/auth/login`;
      const payload = isSignUp 
        ? { fullName, email, phone, password, role: roleTab }
        : { fullName, email, password, role: roleTab };

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const userData = await response.json();
          const authUser = { ...userData, role: roleTab };
          handleSetUser(authUser);

          if (roleTab === 'student') {
            setCurrentView('STUDENT_BROWSE');
          } else {
            const messRes = await fetch(`${API_BASE_URL}/api/mess/owner?email=${encodeURIComponent(email)}`);
            if (messRes.ok) {
              const messData = await messRes.json();
              if (messData && messData.id) {
                setCurrentView('OWNER_DASHBOARD');
                return;
              }
            }
            setCurrentView('OWNER_SETUP');
          }
        } else {
          const errorMsg = await response.text();
          alert(`Error (${response.status}): ${errorMsg || 'Authentication failed'}`);
        }
      } catch (err) {
        console.error(err);
        alert('Could not connect to backend server.');
      }
    };

    return (
      <div 
        className="min-h-screen flex items-center justify-center p-6 bg-no-repeat bg-cover bg-fixed bg-center relative"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1585937421612-70a008356fbe?q=80&w=2000&auto=format&fit=crop')" }}
      >
        <div className="fixed inset-0 bg-black/50 z-0"></div>

        <div className="relative z-10 bg-white/95 backdrop-blur-md rounded-[3rem] max-w-md w-full p-8 md:p-12 shadow-2xl transition-all">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-sans font-bold text-pink-600 tracking-tighter leading-none">JEVAN.ready</h1>
            <p className="text-slate-600 text-xs mt-2 font-bold uppercase tracking-widest opacity-80">Fresh meals, click away.</p>
          </div>

          {/* STUDENT / OWNER ROLE SWITCH */}
          <div className="flex border-b-2 border-slate-100 mb-8">
            <button 
              type="button"
              onClick={() => handleRoleTabChange('student')} 
              className={`flex-1 pb-3 text-lg font-extrabold transition-all uppercase tracking-wider ${roleTab === 'student' ? 'text-pink-600 border-b-4 border-pink-600' : 'hover:text-pink-500 text-slate-400'}`}
            >
              Student
            </button>
            <button 
              type="button"
              onClick={() => handleRoleTabChange('owner')} 
              className={`flex-1 pb-3 text-lg font-extrabold transition-all uppercase tracking-wider ${roleTab === 'owner' ? 'text-pink-600 border-b-4 border-pink-600' : 'hover:text-pink-500 text-slate-400'}`}
            >
              Owner
            </button>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl text-slate-900 font-bold tracking-tight">
                {isSignUp ? `Create ${roleTab === 'student' ? 'Student' : 'Owner'} Account` : `${roleTab === 'student' ? 'Student' : 'Owner'} Sign In`}
              </h2>
            </div>

            <form className="space-y-4" onSubmit={handleAuthSubmit}>
              <input 
                type="text" 
                placeholder={roleTab === 'student' ? "Full Name" : "Mess / Business Name"} 
                required 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-400 font-semibold text-slate-700"
              />

              <input 
                type="email" 
                placeholder="Email Address" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-400 font-semibold text-slate-700"
              />

              {isSignUp && (
                <input 
                  type="tel" 
                  placeholder="Phone Number" 
                  required 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-400 font-semibold text-slate-700"
                />
              )}

              <input 
                type="password" 
                placeholder="Password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-400 font-semibold text-slate-700"
              />

              <button type="submit" className="w-full mt-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white font-black py-4 rounded-2xl shadow-xl hover:-translate-y-1 active:scale-95 transition-all text-lg tracking-wide uppercase">
                {isSignUp ? "CREATE ACCOUNT" : "ENTER PORTAL"}
              </button>
            </form>

            <div className="text-center pt-4 border-t border-slate-100">
              <p className="text-sm font-semibold text-slate-600">
                {isSignUp ? "Already have an account?" : "First time visiting JEVAN.ready?"}
              </p>
              <button 
                type="button" 
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  resetForm();
                }}
                className="mt-1 text-pink-600 font-bold hover:underline text-sm uppercase tracking-wider"
              >
                {isSignUp ? "Sign In Instead" : "Create New Account"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // 2. OWNER SETUP / EDIT VIEW
  // ==========================================
  const OwnerSetupView = ({ existingMess, onSaveComplete }) => {
    const [loc, setLoc] = useState(existingMess?.location || '');
    const [fee, setFee] = useState(existingMess?.monthlyFee || '');
    const [nv, setNv] = useState(existingMess?.nonVegRate || '');
    const [time, setTime] = useState(existingMess?.timings || '');
    const [menu, setMenu] = useState(existingMess?.menuHighlights || '');
    const [file, setFile] = useState(null);

    const inputStyle = "w-full p-4 bg-white border-2 border-slate-200 rounded-2xl outline-none focus:border-pink-500 font-semibold text-slate-700 transition-all";

    const handleSubmit = async (e) => {
      e.preventDefault();
      const formData = new FormData();
      formData.append('ownerEmail', user?.email || '');
      formData.append('messName', user?.fullName || '');
      formData.append('loc', loc);
      formData.append('fee', fee);
      formData.append('nv', nv);
      formData.append('time', time);
      formData.append('menu', menu);
      if (file) formData.append('mess_photo', file);

      const endpoint = existingMess ? `${API_BASE_URL}/api/mess/update/${existingMess.id}` : `${API_BASE_URL}/api/mess/setup`;
      const method = existingMess ? 'PUT' : 'POST';

      try {
        const response = await fetch(endpoint, { method, body: formData });
        if (response.ok) {
          if (onSaveComplete) onSaveComplete();
          else setCurrentView('OWNER_DASHBOARD');
        } else {
          alert('Error saving mess profile. Please check Spring Boot terminal logs.');
        }
      } catch (err) {
        console.error(err);
        alert('Server communication error.');
      }
    };

    return (
      <div className="bg-slate-50 min-h-screen pb-12">
        <nav className="bg-white border-b p-4 mb-8 sticky top-0 z-50">
          <div className="max-w-5xl mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold text-pink-600">JEVAN<span className="text-slate-800">.READY</span></h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-600 font-bold">{user?.fullName}</span>
              <button onClick={handleLogout} className="bg-rose-100 text-rose-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-rose-200">
                Logout
              </button>
            </div>
          </div>
        </nav>

        <main className="max-w-4xl mx-auto px-4">
          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-6">{existingMess ? 'Edit Mess Profile' : '1. Basic Information'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input type="text" required placeholder="Full Address" value={loc} onChange={(e) => setLoc(e.target.value)} className={inputStyle} />
                <input type="number" required placeholder="Monthly Fee (₹)" value={fee} onChange={(e) => setFee(e.target.value)} className={inputStyle} />
                <input type="text" placeholder="Non-Veg Rate (₹)" value={nv} onChange={(e) => setNv(e.target.value)} className={inputStyle} />
                <input type="text" placeholder="Timings (e.g. 8AM-10PM)" value={time} onChange={(e) => setTime(e.target.value)} className={inputStyle} />
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-bold text-slate-800 mb-2">Mess Photo</h3>
                <input 
                  type="file" 
                  accept="image/*" 
                  required={!existingMess}
                  onChange={(e) => setFile(e.target.files[0])}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100 cursor-pointer"
                />
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-bold text-slate-800 mb-2">Menu Highlights</h3>
                <textarea rows="4" placeholder="Sunday Special..." value={menu} onChange={(e) => setMenu(e.target.value)} className={inputStyle}></textarea>
              </div>

              <button type="submit" className="w-full mt-8 bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-black transition-all">
                {existingMess ? 'Save Changes' : 'Publish My Mess'}
              </button>
            </div>
          </form>
        </main>
      </div>
    );
  };

  // ==========================================
  // 3. OWNER DASHBOARD VIEW
  // ==========================================
  const OwnerDashboardView = () => {
    const [bookings, setBookings] = useState([]);
    const [totalEarnings, setTotalEarnings] = useState(0);
    const [messDetails, setMessDetails] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const loadDashboardData = () => {
      if (!user?.email) return;

      fetch(`${API_BASE_URL}/api/bookings/owner?messName=${encodeURIComponent(user.fullName)}`)
        .then((res) => res.json())
        .then((data) => {
          setBookings(data.bookings || []);
          setTotalEarnings(data.totalEarnings || 0);
        })
        .catch((err) => console.error(err));

      fetch(`${API_BASE_URL}/api/mess/owner?email=${encodeURIComponent(user.email)}`)
        .then((res) => res.json())
        .then((data) => setMessDetails(data))
        .catch((err) => console.error(err));
    };

    useEffect(() => {
      loadDashboardData();
    }, []);

    const handleDeleteMess = async () => {
      if (!messDetails?.id) return;
      if (!window.confirm('Are you sure you want to delete your mess profile? This action cannot be undone.')) return;

      try {
        const res = await fetch(`${API_BASE_URL}/api/mess/${messDetails.id}`, { method: 'DELETE' });
        if (res.ok) {
          alert('Mess profile deleted successfully.');
          setCurrentView('OWNER_SETUP');
        } else {
          alert('Failed to delete mess profile.');
        }
      } catch (err) {
        console.error(err);
      }
    };

    if (isEditing) {
      return (
        <OwnerSetupView 
          existingMess={messDetails} 
          onSaveComplete={() => {
            setIsEditing(false);
            loadDashboardData();
          }} 
        />
      );
    }

    return (
      <div className="bg-slate-50 min-h-screen">
        <nav className="bg-white border-b p-4 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold text-pink-600">JEVAN.READY</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-slate-600">{user?.fullName}</span>
              <button onClick={handleLogout} className="bg-rose-100 text-rose-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-rose-200">
                Logout
              </button>
            </div>
          </div>
        </nav>

        <main className="max-w-6xl mx-auto p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-black text-slate-800">Owner Dashboard</h2>
            <div className="flex gap-4">
              <button onClick={() => setIsEditing(true)} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-black">
                Edit Mess Profile
              </button>
              <button onClick={handleDeleteMess} className="bg-rose-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-rose-700">
                Delete Mess Profile
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-pink-600 p-8 rounded-[2rem] text-white flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider opacity-80">Total Earnings</p>
                <h3 className="text-5xl font-black mt-2">₹{totalEarnings}</h3>
              </div>
              <p className="text-xs opacity-75 mt-4">Calculated from confirmed student bookings.</p>
            </div>

            <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
              <h2 className="text-2xl font-bold mb-6">Student Bookings</h2>
              <div className="space-y-4">
                {bookings.length > 0 ? (
                  bookings.map((b) => (
                    <div key={b.id} className="flex justify-between items-center p-5 bg-slate-50 rounded-2xl border border-slate-100">
                      <div>
                        <p className="font-bold text-slate-800">{b.studentEmail}</p>
                        <p className="text-xs text-slate-400">{b.bookingDate} | {b.mealType}</p>
                      </div>
                      <span className="font-bold text-slate-900">₹{b.price}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-20 text-slate-400 font-semibold">No bookings registered yet.</p>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  };

  // ==========================================
  // 4. STUDENT BROWSE VIEW
  // ==========================================
  const StudentBrowseView = () => {
    const [messes, setMesses] = useState([]);
    const [history, setHistory] = useState([]);
    const [modalData, setModalData] = useState(null);
    const [bookingDate, setBookingDate] = useState('');
    const [mealType, setMealType] = useState('Veg');

    const fetchMesses = () => {
      fetch(`${API_BASE_URL}/api/mess`)
        .then((res) => res.json())
        .then((data) => setMesses(data))
        .catch((err) => console.error(err));
    };

    const fetchHistory = () => {
      if (!user?.email) return;
      fetch(`${API_BASE_URL}/api/bookings/student?email=${encodeURIComponent(user.email)}`)
        .then((res) => res.json())
        .then((data) => setHistory(data))
        .catch((err) => console.error(err));
    };

    useEffect(() => {
      fetchMesses();
      fetchHistory();
    }, []);

    const handleConfirmBooking = async (e) => {
      e.preventDefault();
      try {
        const response = await fetch(`${API_BASE_URL}/api/bookings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentEmail: user.email,
            messName: modalData.messName,
            mealType: mealType,
            bookingDate: bookingDate,
            price: modalData.price
          })
        });

        if (response.ok) {
          alert('Booking confirmed successfully!');
          setModalData(null);
          fetchHistory();
        } else {
          alert('Booking failed.');
        }
      } catch (err) {
        console.error(err);
      }
    };

    const handleCancelBooking = async (bookingId) => {
      if (!window.confirm('Are you sure you want to cancel this booking?')) return;

      try {
        const response = await fetch(`${API_BASE_URL}/api/bookings/${bookingId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          alert('Booking cancelled successfully.');
          fetchHistory();
        } else {
          alert('Could not cancel booking.');
        }
      } catch (err) {
        console.error(err);
        alert('Error communicating with the server.');
      }
    };

    return (
      <div className="min-h-screen text-slate-800 bg-gradient-to-br from-rose-50 via-pink-50 to-rose-50">
        <nav className="sticky top-0 z-40 p-6 bg-white/75 backdrop-blur-md border-b">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-4xl font-black text-pink-600 tracking-tighter uppercase">JEVAN.READY</h1>
            <div className="flex items-center gap-6">
              <a href="#myBookings" className="text-sm font-black text-slate-500 hover:text-slate-900 uppercase">My History</a>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold">
                  {user?.fullName?.charAt(0) || 'S'}
                </div>
                <button onClick={handleLogout} className="bg-rose-100 text-rose-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-rose-200 transition-all">
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-8 py-16">
          <header className="mb-16">
            <h2 className="text-5xl font-black text-slate-900 uppercase leading-none">
              Discover Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-400">
                Perfect Meal.
              </span>
            </h2>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {messes.length > 0 ? (
              messes.map((m) => (
                <div key={m.id || m.messName} className="bg-white p-8 border border-pink-50 rounded-[2.5rem] shadow-lg flex flex-col justify-between">
                  <div>
                    {m.imagePath && (
                      <img 
                        src={`${API_BASE_URL}${m.imagePath}`} 
                        alt={m.messName} 
                        className="w-full h-48 object-cover rounded-2xl mb-6"
                      />
                    )}
                    <h3 className="text-2xl font-black text-slate-800 uppercase">{m.messName}</h3>
                    <p className="text-slate-400 font-bold text-xs uppercase mt-2">📍 {m.location}</p>
                    {m.timings && <p className="text-xs text-slate-500 mt-1">🕒 {m.timings}</p>}
                    {m.menuHighlights && <p className="text-xs text-slate-600 mt-3 bg-slate-50 p-3 rounded-xl border">🍽️ {m.menuHighlights}</p>}
                  </div>
                  <div className="mt-8 flex justify-between items-center">
                    <span className="text-2xl font-bold text-slate-900">₹{m.monthlyFee}</span>
                    <button 
                      onClick={() => setModalData({ messName: m.messName, price: m.monthlyFee })} 
                      className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-all"
                    >
                      Reserve
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-400 col-span-3 text-center py-10 font-medium">No mess listings available right now.</p>
            )}
          </div>

          <section id="myBookings" className="mt-28 pt-16 border-t border-slate-200">
            <h2 className="text-3xl font-black mb-8 text-slate-900">Recent Activity</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {history.length > 0 ? (
                history.map((h) => (
                  <div key={h.id} className="bg-white p-6 rounded-[2rem] shadow-md flex justify-between items-center border border-slate-100">
                    <div>
                      <h4 className="font-bold text-lg text-slate-800">{h.messName}</h4>
                      <p className="text-xs text-slate-400">{h.bookingDate} • {h.mealType}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-pink-600 font-bold">₹{h.price}</span>
                      <button 
                        onClick={() => handleCancelBooking(h.id)} 
                        className="bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 font-medium">No active or historical bookings found.</p>
              )}
            </div>
          </section>
        </main>

        {/* BOOKING MODAL */}
        {modalData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <form onSubmit={handleConfirmBooking} className="bg-white p-10 rounded-[3rem] w-full max-w-md shadow-2xl">
              <h2 className="text-2xl font-bold mb-2">Confirm Booking</h2>
              <p className="text-slate-600 font-semibold mb-6">{modalData.messName}</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Date</label>
                  <input 
                    type="date" 
                    required 
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full p-4 border rounded-xl outline-none focus:border-pink-500 font-semibold text-slate-700" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-400 mb-1">Meal Option</label>
                  <select 
                    value={mealType} 
                    onChange={(e) => setMealType(e.target.value)}
                    className="w-full p-4 border rounded-xl outline-none focus:border-pink-500 font-semibold text-slate-700"
                  >
                    <option value="Veg">Pure Veg</option>
                    <option value="Non-Veg">Non-Veg</option>
                  </select>
                </div>
              </div>
              <div className="mt-8 flex gap-4">
                <button type="submit" className="flex-1 bg-pink-600 text-white py-4 rounded-xl font-bold hover:bg-pink-700 transition-all">
                  Confirm
                </button>
                <button 
                  type="button" 
                  onClick={() => setModalData(null)} 
                  className="flex-1 bg-slate-100 py-4 rounded-xl font-semibold hover:bg-slate-200 transition-all text-slate-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  };

  // Router view selector
  if (currentView === 'AUTH') return <AuthView />;
  if (currentView === 'OWNER_SETUP') return <OwnerSetupView />;
  if (currentView === 'OWNER_DASHBOARD') return <OwnerDashboardView />;
  if (currentView === 'STUDENT_BROWSE') return <StudentBrowseView />;

  return null;
}