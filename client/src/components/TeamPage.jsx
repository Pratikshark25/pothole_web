import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

function TeamPage() {
  const [authenticatedUser, setAuthenticatedUser] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginForm, setLoginForm] = useState({ github: '', password: '' });
  const [loginError, setLoginError] = useState('');

  const [teamMembers, setTeamMembers] = useState([
    {
      id: 1,
      name: 'Sai Ritesh',
      roll: 'sairiteshdomakuntla',
      role: 'Developer',
      image: null,
      bio: 'Passionate about building scalable web applications and solving real-world problems through technology.',
      skills: ['React', 'Node.js', 'MongoDB', 'Express'],
      github: 'https://github.com/sairiteshdomakuntla',
      linkedin: ''
    },
    {
      id: 2,
      name: 'Charmi Gaddale',
      roll: 'gaddalecharmi',
      role: 'Developer',
      image: null,
      bio: 'Specializes in creating beautiful and intuitive user interfaces with modern frontend technologies.',
      skills: ['React', 'JavaScript', 'UI/UX', 'CSS'],
      github: 'https://github.com/gaddalecharmi',
      linkedin: ''
    },
    {
      id: 3,
      name: 'A Ramsai',
      roll: 'a-ramsai',
      role: 'Developer',
      image: null,
      bio: 'Focused on building robust APIs and managing database architecture for efficient data handling.',
      skills: ['Node.js', 'Express', 'MongoDB', 'REST API'],
      github: 'https://github.com/a-ramsai',
      linkedin: ''
    },
    {
      id: 4,
      name: 'Charan Chandu',
      roll: 'CharanChandu-11',
      role: 'Developer',
      image: null,
      bio: 'Designs user-centric interfaces that provide seamless experiences across all platforms.',
      skills: ['React', 'JavaScript', 'UI/UX'],
      github: 'https://github.com/CharanChandu-11',
      linkedin: ''
    },
    {
      id: 5,
      name: 'Nithya',
      roll: 'Nithya4115',
      role: 'Developer',
      image: null,
      bio: 'Passionate about creating efficient solutions and clean code architecture.',
      skills: ['JavaScript', 'React', 'CSS'],
      github: 'https://github.com/Nithya4115',
      linkedin: ''
    },
    {
      id: 6,
      name: 'Kavya Sahithi',
      roll: 'Kavyasahithi006',
      role: 'Developer',
      image: null,
      bio: 'Enthusiastic developer focused on learning and implementing modern web technologies.',
      skills: ['React', 'Node.js', 'JavaScript'],
      github: 'https://github.com/Kavyasahithi006',
      linkedin: ''
    },
    {
      id: 7,
      name: 'Yoshith',
      roll: 'Yoshith-9030',
      role: 'Developer',
      image: null,
      bio: 'Dedicated to writing clean, maintainable code and building user-friendly applications.',
      skills: ['JavaScript', 'React', 'MongoDB'],
      github: 'https://github.com/Yoshith-9030',
      linkedin: ''
    },
    {
      id: 8,
      name: 'Rasagna',
      roll: 'Rasagna2810',
      role: 'Developer',
      image: null,
      bio: 'Focused on creating responsive designs and seamless user experiences.',
      skills: ['React', 'CSS', 'JavaScript', 'UI/UX'],
      github: 'https://github.com/Rasagna2810',
      linkedin: ''
    },
    {
      id: 9,
      name: 'Pranavi',
      roll: 'Pranavi1110',
      role: 'Developer',
      image: null,
      bio: 'Passionate about full-stack development and building scalable applications.',
      skills: ['React', 'Node.js', 'Express', 'MongoDB'],
      github: 'https://github.com/Pranavi1110',
      linkedin: ''
    },
    {
      id: 10,
      name: 'Karthik G',
      roll: 'karthikG0017',
      role: 'Developer',
      image: null,
      bio: 'Enthusiastic about backend development and database optimization.',
      skills: ['Node.js', 'MongoDB', 'Express', 'REST API'],
      github: 'https://github.com/karthikG0017',
      linkedin: ''
    },
    {
      id: 11,
      name: 'Pooja',
      roll: 'Pooja-257',
      role: 'Developer',
      image: null,
      bio: 'Dedicated to creating efficient and scalable web solutions.',
      skills: ['React', 'JavaScript', 'CSS'],
      github: 'https://github.com/Pooja-257',
      linkedin: ''
    },
    {
      id: 12,
      name: 'K N Roy',
      roll: 'knroy07',
      role: 'Developer',
      image: null,
      bio: 'Focused on building robust applications with modern technologies.',
      skills: ['React', 'Node.js', 'JavaScript'],
      github: 'https://github.com/knroy07',
      linkedin: ''
    },
    {
      id: 13,
      name: 'Mohit',
      roll: 'MohitKarthiekeya',
      role: 'Developer',
      image: null,
      bio: 'Passionate about learning new technologies and building innovative solutions.',
      skills: ['JavaScript', 'React', 'Node.js'],
      github: 'https://github.com/MohitKarthiekeya',
      linkedin: ''
    },
    {
      id: 14,
      name: 'Shashank Vinnakota',
      roll: 'ShashankVinnakota',
      role: 'Developer',
      image: null,
      bio: 'Dedicated to writing clean code and building efficient applications.',
      skills: ['React', 'JavaScript', 'CSS'],
      github: 'https://github.com/ShashankVinnakota',
      linkedin: ''
    },
    {
      id: 15,
      name: 'Kowshik',
      roll: 'kowshik86',
      role: 'Developer',
      image: null,
      bio: 'Focused on creating user-friendly interfaces and seamless experiences.',
      skills: ['React', 'JavaScript', 'UI/UX'],
      github: 'https://github.com/kowshik86',
      linkedin: ''
    },
    {
      id: 16,
      name: 'Manish Narmala',
      roll: 'manishnarmala',
      role: 'Developer',
      image: null,
      bio: 'Enthusiastic about full-stack development and modern web technologies.',
      skills: ['React', 'Node.js', 'MongoDB'],
      github: 'https://github.com/manishnarmala',
      linkedin: ''
    },
    {
      id: 17,
      name: 'Bhavya Sree',
      roll: 'bhavyasree13',
      role: 'Developer',
      image: null,
      bio: 'Passionate about creating efficient and scalable web applications.',
      skills: ['React', 'JavaScript', 'CSS'],
      github: 'https://github.com/bhavyasree13',
      linkedin: ''
    },
    {
      id: 18,
      name: 'Ritheesh Reddy',
      roll: 'ritheeshreddy05',
      role: 'Developer',
      image: null,
      bio: 'Focused on backend development and API design.',
      skills: ['Node.js', 'Express', 'MongoDB'],
      github: 'https://github.com/ritheeshreddy05',
      linkedin: ''
    },
    {
      id: 19,
      name: 'Raavi Havish',
      roll: 'Raavi-Havish',
      role: 'Developer',
      image: null,
      bio: 'Dedicated to building robust and scalable applications.',
      skills: ['React', 'Node.js', 'JavaScript'],
      github: 'https://github.com/Raavi-Havish',
      linkedin: ''
    },
    {
      id: 20,
      name: 'Jahnavi',
      roll: 'Jahnavi2057',
      role: 'Developer',
      image: null,
      bio: 'Passionate about frontend development and user experience design.',
      skills: ['React', 'CSS', 'JavaScript', 'UI/UX'],
      github: 'https://github.com/Jahnavi2057',
      linkedin: ''
    },
    {
      id: 21,
      name: 'Anudeep Reddy Veerati',
      roll: 'AnudeepReddyVeerati',
      role: 'Developer',
      image: null,
      bio: 'Focused on creating efficient and maintainable code.',
      skills: ['React', 'JavaScript', 'Node.js'],
      github: 'https://github.com/AnudeepReddyVeerati',
      linkedin: ''
    },
    {
      id: 22,
      name: 'Goutham Lingoju',
      roll: 'gouthamlingoju',
      role: 'Developer',
      image: null,
      bio: 'Enthusiastic about full-stack development and modern technologies.',
      skills: ['React', 'Node.js', 'MongoDB', 'Express'],
      github: 'https://github.com/gouthamlingoju',
      linkedin: ''
    },
    {
      id: 23,
      name: 'Vamshi Krishna',
      roll: 'vk-2828',
      role: 'Developer',
      image: null,
      bio: 'Passionate about building scalable applications and clean architecture.',
      skills: ['React', 'Node.js', 'JavaScript'],
      github: 'https://github.com/vk-2828',
      linkedin: ''
    },
    {
      id: 24,
      name: 'P Thanmayee',
      roll: 'pthanmayee',
      role: 'Developer',
      image: null,
      bio: 'Focused on creating beautiful and functional user interfaces.',
      skills: ['React', 'CSS', 'JavaScript'],
      github: 'https://github.com/pthanmayee',
      linkedin: ''
    },
    {
      id: 25,
      name: 'Architha',
      roll: 'architha-196',
      role: 'Developer',
      image: null,
      bio: 'Dedicated to writing efficient code and building user-friendly applications.',
      skills: ['React', 'JavaScript', 'CSS'],
      github: 'https://github.com/architha-196',
      linkedin: ''
    },
    {
      id: 26,
      name: 'Khyatham Pratiksha Reddy',
      roll: 'khyathampratikshareddy-gif',
      role: 'Developer',
      image: null,
      bio: 'Enthusiastic about learning and implementing modern web technologies.',
      skills: ['React', 'JavaScript', 'UI/UX'],
      github: 'https://github.com/khyathampratikshareddy-gif',
      linkedin: ''
    },
    {
      id: 27,
      name: 'Hemanth P',
      roll: 'hemanth-p-41',
      role: 'Developer',
      image: null,
      bio: 'Passionate about full-stack development and building innovative solutions.',
      skills: ['React', 'Node.js', 'MongoDB', 'Express'],
      github: 'https://github.com/hemanth-p-41',
      linkedin: ''
    }
  ]);

  const [selectedMember, setSelectedMember] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Load team data from localStorage on mount
  React.useEffect(() => {
    const savedTeam = localStorage.getItem('potholemapper-team');
    if (savedTeam) {
      setTeamMembers(JSON.parse(savedTeam));
    }
  }, []);

  // Save team data to localStorage whenever it changes
  React.useEffect(() => {
    localStorage.setItem('potholemapper-team', JSON.stringify(teamMembers));
  }, [teamMembers]);

  const handleImageUpload = (memberId, event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTeamMembers(prev =>
          prev.map(member =>
            member.id === memberId
              ? { ...member, image: reader.result }
              : member
          )
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const startEditing = (member) => {
    // Check if user is authenticated and it's their own profile
    if (!authenticatedUser) {
      setShowLoginModal(true);
      setSelectedMember(null);
      return;
    }
    
    if (authenticatedUser !== member.roll) {
      alert('You can only edit your own profile!');
      return;
    }
    
    setEditingMember(member.id);
    setEditForm({ ...member });
    setSelectedMember(null);
  };

  const handleLogin = () => {
    setLoginError('');
    
    // Find the team member by GitHub username
    const member = teamMembers.find(m => m.roll.toLowerCase() === loginForm.github.toLowerCase());
    
    if (!member) {
      setLoginError('GitHub username not found in team list');
      return;
    }
    
    // Simple password check (in production, use proper authentication)
    // Password format: github_vnr (e.g., gaddalecharmi_vnr)
    const expectedPassword = `${loginForm.github.toLowerCase()}_vnr`;
    
    if (loginForm.password !== expectedPassword) {
      setLoginError('Incorrect password. Use format: yourgithub_vnr');
      return;
    }
    
    // Authenticate user
    setAuthenticatedUser(member.roll);
    setShowLoginModal(false);
    setLoginForm({ github: '', password: '' });
    
    // Show success message
    alert(`Welcome ${member.name}! You can now edit your profile.`);
  };

  const handleLogout = () => {
    setAuthenticatedUser(null);
  };

  const handleEditChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSkillChange = (index, value) => {
    const newSkills = [...editForm.skills];
    newSkills[index] = value;
    setEditForm(prev => ({ ...prev, skills: newSkills }));
  };

  const addSkill = () => {
    setEditForm(prev => ({ ...prev, skills: [...prev.skills, ''] }));
  };

  const removeSkill = (index) => {
    const newSkills = editForm.skills.filter((_, i) => i !== index);
    setEditForm(prev => ({ ...prev, skills: newSkills }));
  };

  const saveEdit = () => {
    setTeamMembers(prev =>
      prev.map(member =>
        member.id === editingMember ? editForm : member
      )
    );
    setEditingMember(null);
    setEditForm({});
  };

  const cancelEdit = () => {
    setEditingMember(null);
    setEditForm({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-black to-slate-900">
      {/* Header */}
      <div className="bg-black/50 backdrop-blur-lg border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-white hover:text-orange-400 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
            Our Team
          </h1>
          <div>
            {authenticatedUser ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400">
                  Logged in as <span className="text-orange-400 font-semibold">{teamMembers.find(m => m.roll === authenticatedUser)?.name}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 shadow-lg shadow-orange-500/30"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Login to Edit
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-600 rounded-full filter blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-block mb-4"
          >
            <span className="bg-orange-500/10 text-orange-400 px-4 py-2 rounded-full text-sm font-medium border border-orange-500/20">
              VNR VJIET Student Project
            </span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold mb-4 text-white"
          >
            Meet Our Development Team
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-gray-400 max-w-2xl mx-auto"
          >
            A group of passionate students from VNR Vignana Jyothi Institute working together to solve real-world infrastructure problems through technology.
          </motion.p>
        </div>
      </section>

      {/* Team Members Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: (index % 12) * 0.03 }}
                className="group"
              >
                <div 
                  className="bg-slate-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-slate-700/50 hover:border-orange-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10 cursor-pointer h-full flex flex-col"
                  onClick={() => setSelectedMember(member)}
                >
                  {/* Image Section */}
                  <div className="relative h-56 bg-slate-800/80 overflow-hidden flex-shrink-0">
                    {member.image ? (
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gradient-to-br from-slate-700/50 to-slate-800/50">
                        <div className="w-20 h-20 rounded-full bg-slate-700 border-4 border-orange-500/20 flex items-center justify-center text-orange-400 text-3xl font-bold group-hover:border-orange-500/40 transition-colors">
                          {member.name.charAt(0)}
                        </div>
                      </div>
                    )}

                    {/* Upload and Edit Buttons - Only for authenticated user's own profile */}
                    {authenticatedUser === member.roll && (
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2 p-4">
                        <label className="cursor-pointer w-full" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(member.id, e)}
                          />
                          <div className="bg-orange-500/90 hover:bg-orange-500 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors text-sm w-full backdrop-blur-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Upload Photo
                          </div>
                        </label>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(member);
                          }}
                          className="bg-blue-500/90 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors text-sm w-full backdrop-blur-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit Profile
                        </button>
                      </div>
                    )}

                    {/* Subtle Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent pointer-events-none"></div>
                  </div>

                  {/* Info Section */}
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-orange-400 transition-colors line-clamp-1">
                        {member.name}
                      </h3>
                      <div className="mb-3">
                        <span className="inline-block text-orange-500/80 font-mono text-xs bg-orange-500/5 px-3 py-1.5 rounded-md border border-orange-500/20">
                          @{member.roll}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2 min-h-[40px]">
                        {member.role}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-700/50 mt-auto">
                      <span className="text-gray-500 text-xs flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Click to view
                      </span>
                      {member.github && (
                        <a
                          href={member.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-gray-400 hover:text-orange-400 transition-colors flex items-center justify-center w-8 h-8 rounded-lg hover:bg-slate-700/50"
                          title="View GitHub Profile"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Login Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <div
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowLoginModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl max-w-md w-full border-2 border-orange-500/30 shadow-2xl shadow-orange-500/20"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">Developer Login</h2>
                  <p className="text-gray-400">Login to edit your profile</p>
                </div>

                {loginError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm"
                  >
                    {loginError}
                  </motion.div>
                )}

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      GitHub Username
                    </label>
                    <input
                      type="text"
                      value={loginForm.github}
                      onChange={(e) => setLoginForm({ ...loginForm, github: e.target.value })}
                      placeholder="e.g., gaddalecharmi"
                      className="w-full bg-slate-700/50 text-white px-4 py-3 rounded-lg border-2 border-slate-600 focus:border-orange-500 focus:outline-none transition-colors"
                      onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      placeholder="yourgithub_vnr"
                      className="w-full bg-slate-700/50 text-white px-4 py-3 rounded-lg border-2 border-slate-600 focus:border-orange-500 focus:outline-none transition-colors"
                      onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Format: <code className="text-orange-400">yourgithub_vnr</code>
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleLogin}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 shadow-lg shadow-orange-500/30"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => {
                        setShowLoginModal(false);
                        setLoginError('');
                        setLoginForm({ github: '', password: '' });
                      }}
                      className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-700">
                  <p className="text-xs text-gray-500 text-center">
                    Only team members can login to edit their profiles.<br />
                    Contact admin if you forgot your credentials.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Profile Modal */}
      {editingMember && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={cancelEdit}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border-2 border-orange-500"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-white">Edit Your Profile</h2>
                <button
                  onClick={cancelEdit}
                  className="bg-red-600 hover:bg-red-700 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => handleEditChange('name', e.target.value)}
                    className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-orange-500 focus:outline-none transition-colors"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                  <input
                    type="text"
                    value={editForm.role}
                    onChange={(e) => handleEditChange('role', e.target.value)}
                    placeholder="e.g., Full Stack Developer"
                    className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-orange-500 focus:outline-none transition-colors"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => handleEditChange('bio', e.target.value)}
                    rows={4}
                    className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-orange-500 focus:outline-none transition-colors resize-none"
                  />
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Skills</label>
                  <div className="space-y-2">
                    {editForm.skills?.map((skill, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={skill}
                          onChange={(e) => handleSkillChange(index, e.target.value)}
                          className="flex-1 bg-slate-700 text-white px-4 py-2 rounded-lg border border-slate-600 focus:border-orange-500 focus:outline-none transition-colors"
                        />
                        <button
                          onClick={() => removeSkill(index)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addSkill}
                      className="text-orange-400 hover:text-orange-300 text-sm font-medium flex items-center gap-1"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Skill
                    </button>
                  </div>
                </div>

                {/* GitHub */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">GitHub Profile</label>
                  <input
                    type="url"
                    value={editForm.github}
                    onChange={(e) => handleEditChange('github', e.target.value)}
                    placeholder="https://github.com/yourusername"
                    className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-orange-500 focus:outline-none transition-colors"
                  />
                </div>

                {/* LinkedIn */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">LinkedIn Profile</label>
                  <input
                    type="url"
                    value={editForm.linkedin}
                    onChange={(e) => handleEditChange('linkedin', e.target.value)}
                    placeholder="https://linkedin.com/in/yourusername"
                    className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:border-orange-500 focus:outline-none transition-colors"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={saveEdit}
                    className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 shadow-lg"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Detailed Profile Modal */}
      {selectedMember && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedMember(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2 border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Action Buttons */}
            <div className="absolute top-4 right-4 flex gap-2">
              {authenticatedUser === selectedMember.roll && (
                <button
                  onClick={() => {
                    startEditing(selectedMember);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors"
                  title="Edit Profile"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}
              <button
                onClick={() => setSelectedMember(null)}
                className="bg-red-600 hover:bg-red-700 text-white rounded-full w-10 h-10 flex items-center justify-center transition-colors"
                title="Close"
              >
                ✕
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-8 p-8">
              {/* Left Side - Image */}
              <div>
                <div className="relative h-96 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl overflow-hidden">
                  {selectedMember.image ? (
                    <img
                      src={selectedMember.image}
                      alt={selectedMember.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="w-48 h-48 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-8xl font-bold">
                        {selectedMember.name.charAt(0)}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side - Details */}
              <div>
                <h2 className="text-4xl font-bold text-white mb-2">
                  {selectedMember.name}
                </h2>
                <div className="text-orange-500 font-mono text-lg mb-2 bg-orange-500/10 inline-block px-4 py-2 rounded-lg">
                  {selectedMember.roll}
                </div>
                <p className="text-xl text-gray-300 mb-6">
                  {selectedMember.role}
                </p>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                    <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    About
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {selectedMember.bio}
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedMember.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="bg-slate-700 text-gray-300 px-4 py-2 rounded-lg text-sm border border-slate-600"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  {selectedMember.github && (
                    <a
                      href={selectedMember.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                      </svg>
                      GitHub
                    </a>
                  )}
                  {selectedMember.linkedin && (
                    <a
                      href={selectedMember.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                      LinkedIn
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default TeamPage;
