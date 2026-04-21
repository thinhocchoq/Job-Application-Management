import { useState, useEffect } from "react";
import {
  MdOutlineEdit,
  MdAdd,
  MdCameraAlt,
  MdClose,
  MdCheck,
  MdDelete,
} from "react-icons/md";
import { FaGraduationCap, FaBriefcase, FaMapMarkerAlt, FaEnvelope, FaPhone, FaPlus } from "react-icons/fa";
import { usersApi } from "../lib/api";
import ProfileTopBar from "../Components/ProfileTopBar";
import { calculateAge, formatMessageTime } from '../utils/format';

const Profile = () => {
  const [editingPersonal, setEditingPersonal] = useState(false);
  const [editingExperience, setEditingExperience] = useState(false);
  const [editingJobPreferences, setEditingJobPreferences] = useState(false);
  const [editingSkills, setEditingSkills] = useState(false);
  const [editingEducation, setEditingEducation] = useState(false);

  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [dob, setDob] = useState("");
  const [experience, setExperience] = useState("");
  const [jobType, setJobType] = useState("");
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState("");

  const [education, setEducation] = useState([]);
  const [newEdu, setNewEdu] = useState({ school: "", degree: "", field: "", startYear: "", endYear: "" });
  const [editingEduIndex, setEditingEduIndex] = useState(null);

  const [profileError, setProfileError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await usersApi.me();
        setUserName(profile.name || "");
        setUserEmail(profile.email || "");
        setName(profile.name || "");
        setEmail(profile.email || "");
        setPhone(profile.phone || "");
        setLocation(profile.location || "");
        setDob(profile.dob || "");
        setExperience(profile.experience || "");
        setJobType(profile.job_type || "");
        setSkills(Array.isArray(profile.skills) ? profile.skills : []);
        setEducation(Array.isArray(profile.education) ? profile.education : []);
        setProfileError("");
      } catch (error) {
        setProfileError(error.message || "Failed to load profile");
      }
    };
    loadProfile();
  }, []);

  const saveProfile = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setProfileError("");
    try {
      const updated = await usersApi.updateMe({
        name,
        phone,
        location,
        dob,
        experience,
        job_type: jobType,
        skills,
        education,
      });
      setName(updated.name || "");
      setEmail(updated.email || "");
      setPhone(updated.phone || "");
      setLocation(updated.location || "");
      setDob(updated.dob || "");
      setExperience(updated.experience || "");
      setJobType(updated.job_type || "");
      setSkills(Array.isArray(updated.skills) ? updated.skills : []);
      setEducation(Array.isArray(updated.education) ? updated.education : []);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      setProfileError(error.message || "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditToggle = async (section) => {
    const sectionStates = {
      personal: editingPersonal,
      experience: editingExperience,
      jobPreferences: editingJobPreferences,
      skills: editingSkills,
      education: editingEducation,
    };

    if (sectionStates[section] && section !== "education") {
      await saveProfile();
    }

    if (section === "personal") setEditingPersonal(!editingPersonal);
    else if (section === "experience") {
      if (!editingExperience) {
        setEditingExperience(true);
      } else {
        setEditingExperience(false);
      }
    }
    else if (section === "jobPreferences") setEditingJobPreferences(!editingJobPreferences);
    else if (section === "skills") setEditingSkills(!editingSkills);
    else if (section === "education") {
      if (!editingEducation) {
        setEditingEducation(true);
      } else {
        setEditingEducation(false);
      }
    }
  };

  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
    setNewSkill("");
  };

  const handleDeleteSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleAddEducation = () => {
    if (!newEdu.school.trim() || !newEdu.degree.trim()) return;
    if (editingEduIndex !== null) {
      setEducation(education.map((e, i) => i === editingEduIndex ? { ...newEdu } : e));
      setEditingEduIndex(null);
    } else {
      setEducation([...education, { ...newEdu }]);
    }
    setNewEdu({ school: "", degree: "", field: "", startYear: "", endYear: "" });
  };

  const handleEditEducation = (index) => {
    const edu = education[index];
    setNewEdu(edu);
    setEditingEduIndex(index);
  };

  const handleDeleteEducation = (index) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const ActionButton = ({ isEditing, onClick, label = "Save" }) => (
    isEditing ? (
      <button
        disabled={isSaving}
        onClick={onClick}
        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition shadow-sm disabled:opacity-70"
      >
        <MdCheck size={16} />
        {isSaving ? "Saving..." : label}
      </button>
    ) : (
      <button
        onClick={onClick}
        className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition"
      >
        <MdOutlineEdit size={16} />
        Edit
      </button>
    )
  );

  const SideEditButton = ({ isEditing, onClick }) => (
    isEditing ? (
      <button
        disabled={isSaving}
        onClick={onClick}
        className="text-emerald-600 hover:text-emerald-700 disabled:opacity-50"
      >
        <MdCheck size={20} />
      </button>
    ) : (
      <button onClick={onClick} className="text-gray-400 hover:text-emerald-600 transition">
        <MdOutlineEdit size={20} />
      </button>
    )
  );

  return (
    <div className="bg-[#fbfcfa] min-h-screen px-8 pt-4 pb-8 lg:px-10 lg:pt-5 lg:pb-10">
      <ProfileTopBar userName={userName} userEmail={userEmail} />

      <div className="w-full max-w-5xl mx-auto font-sans">
        {/* Alerts */}
        {profileError && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl font-medium">
            {profileError}
          </div>
        )}
        {saveSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-medium flex items-center gap-2">
            <MdCheck size={18} />
            Profile saved successfully!
          </div>
        )}

        {/* Hero */}
        <div className="flex items-center gap-6 mb-8">
          <div className="relative shrink-0">
            <div className="w-28 h-28 rounded-2xl overflow-hidden shadow-sm ring-4 ring-white">
              <img
                src="https://api.dicebear.com/8.x/avataaars/svg?seed=Alex&backgroundColor=0b3b4d"
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <button className="absolute bottom-2 right-2 bg-white/90 backdrop-blur text-gray-600 p-2 rounded-xl shadow-sm hover:bg-white transition">
              <MdCameraAlt size={18} />
            </button>
          </div>

          <div className="flex-1">
            {editingPersonal ? (
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-3xl font-bold border-b-2 border-emerald-400 outline-none bg-transparent pb-1 w-full max-w-sm"
                />
                <SideEditButton isEditing={editingPersonal} onClick={() => handleEditToggle("personal")} />
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">{name || "Your Name"}</h1>
                <SideEditButton isEditing={editingPersonal} onClick={() => handleEditToggle("personal")} />
              </div>
            )}
            <p className="text-gray-500 mt-1">{email || "your@email.com"}</p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {/* Personal Details */}
          <div className="bg-white rounded-[20px] p-6 md:p-8 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Personal Details</h2>
              <ActionButton isEditing={editingPersonal} onClick={() => handleEditToggle("personal")} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <FaEnvelope size={12} /> Email
                </p>
                {editingPersonal ? (
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2 outline-none focus:border-emerald-400 text-sm font-medium" />
                ) : (
                  <p className="font-semibold text-gray-900">{email || "—"}</p>
                )}
              </div>
              <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <FaPhone size={12} /> Phone
                </p>
                {editingPersonal ? (
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2 outline-none focus:border-emerald-400 text-sm font-medium" />
                ) : (
                  <p className="font-semibold text-gray-900">{phone || "—"}</p>
                )}
              </div>
              <div className="bg-gray-50/80 p-5 rounded-2xl border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <FaMapMarkerAlt size={12} /> Location
                </p>
                {editingPersonal ? (
                  <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2 outline-none focus:border-emerald-400 text-sm font-medium" />
                ) : (
                  <p className="font-semibold text-gray-900">{location || "—"}</p>
                )}
              </div>
            </div>
          </div>

          {/* Work Experience */}
          <div className="bg-white rounded-[20px] p-6 md:p-8 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Work Experience</h2>
              <button
                onClick={() => handleEditToggle("experience")}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 text-sm font-semibold rounded-full hover:bg-emerald-100 transition"
              >
                {editingExperience ? (
                  <><MdCheck size={16} /> Done</>
                ) : (
                  <><MdAdd size={16} /> Add</>
                )}
              </button>
            </div>
            <div className="bg-gray-50/80 rounded-2xl p-6 border border-gray-100">
              {editingExperience ? (
                <textarea
                  rows="5"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl p-4 outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 resize-none text-sm"
                  placeholder="Describe your work experience, roles, and achievements..."
                />
              ) : (
                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700 shrink-0">
                    <FaBriefcase />
                  </div>
                  <div>
                    {experience ? (
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{experience}</p>
                    ) : (
                      <p className="text-sm text-gray-400 italic">No experience added yet. Click "Add" to update.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Education */}
          <div className="bg-white rounded-[20px] p-6 md:p-8 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Education</h2>
              <button
                onClick={() => handleEditToggle("education")}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 text-sm font-semibold rounded-full hover:bg-emerald-100 transition"
              >
                {editingEducation ? (
                  <><MdCheck size={16} /> Done</>
                ) : (
                  <><MdAdd size={16} /> Add</>
                )}
              </button>
            </div>

            {education.length === 0 && !editingEducation && (
              <div className="bg-gray-50/80 rounded-2xl p-6 border border-gray-100 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaGraduationCap size={20} className="text-gray-400" />
                </div>
                <p className="text-sm text-gray-400 italic">No education added yet. Click "Add" to add your education.</p>
              </div>
            )}

            <div className="space-y-3 mb-4">
              {education.map((edu, idx) => (
                <div key={idx} className="bg-gray-50/80 rounded-xl p-4 border border-gray-100 flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 shrink-0 mt-0.5">
                    <FaGraduationCap size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">{edu.degree || "Degree"} {edu.field ? `in ${edu.field}` : ""}</p>
                    <p className="text-sm text-gray-500">{edu.school || "School"}</p>
                    {(edu.startYear || edu.endYear) && (
                      <p className="text-xs text-gray-400 mt-1">
                        {edu.startYear}{edu.endYear ? ` - ${edu.endYear}` : edu.startYear ? " - Present" : ""}
                      </p>
                    )}
                  </div>
                  {editingEducation && (
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => handleEditEducation(idx)} className="p-1.5 text-gray-400 hover:text-emerald-600 transition">
                        <MdOutlineEdit size={15} />
                      </button>
                      <button onClick={() => handleDeleteEducation(idx)} className="p-1.5 text-gray-400 hover:text-red-500 transition">
                        <MdDelete size={15} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {editingEducation && (
              <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100 space-y-3">
                <p className="text-sm font-semibold text-gray-700">{editingEduIndex !== null ? "Edit Education" : "Add Education"}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input type="text" placeholder="School / University" value={newEdu.school}
                    onChange={(e) => setNewEdu({ ...newEdu, school: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-400" />
                  <input type="text" placeholder="Degree (e.g. Bachelor)" value={newEdu.degree}
                    onChange={(e) => setNewEdu({ ...newEdu, degree: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-400" />
                  <input type="text" placeholder="Field of Study" value={newEdu.field}
                    onChange={(e) => setNewEdu({ ...newEdu, field: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-400" />
                  <div className="flex gap-2">
                    <input type="text" placeholder="Start Year" value={newEdu.startYear}
                      onChange={(e) => setNewEdu({ ...newEdu, startYear: e.target.value })}
                      className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-400" />
                    <input type="text" placeholder="End Year" value={newEdu.endYear}
                      onChange={(e) => setNewEdu({ ...newEdu, endYear: e.target.value })}
                      className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-emerald-400" />
                  </div>
                </div>
                <button
                  onClick={handleAddEducation}
                  disabled={!newEdu.school.trim() || !newEdu.degree.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-40 transition"
                >
                  <FaPlus size={14} />
                  {editingEduIndex !== null ? "Update" : "Add"}
                </button>
              </div>
            )}
          </div>

          {/* Skills & Job Preferences */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Skills */}
            <div className="bg-[#f7f9fa] rounded-[20px] p-6 md:p-8 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Skills</h2>
                <button onClick={() => handleEditToggle("skills")} className="text-gray-400 hover:text-emerald-600 transition">
                  {editingSkills ? (
                    <span className="text-sm font-bold bg-emerald-600 text-white px-3 py-1 rounded-lg flex items-center gap-1">
                      <MdCheck size={14} /> Done
                    </span>
                  ) : (
                    <MdOutlineEdit size={22} />
                  )}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span key={index} className="bg-emerald-50 text-emerald-700 px-3.5 py-1.5 rounded-full text-sm font-semibold border border-emerald-100 flex items-center gap-2">
                    {skill}
                    {editingSkills && (
                      <button onClick={() => handleDeleteSkill(index)} className="hover:text-red-500 transition">
                        <MdClose size={14} />
                      </button>
                    )}
                  </span>
                ))}
                {editingSkills && (
                  <div className="flex items-center bg-white rounded-full pl-3 pr-1 py-1 border border-gray-200 shadow-sm">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add skill..."
                      className="w-28 text-sm outline-none bg-transparent"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") { e.preventDefault(); handleAddSkill(); }
                        if (e.key === ",") { e.preventDefault(); handleAddSkill(); }
                      }}
                    />
                    <button onClick={handleAddSkill} className="bg-emerald-100 hover:bg-emerald-200 text-emerald-700 rounded-full p-1 transition">
                      <FaPlus size={12} />
                    </button>
                  </div>
                )}
                {skills.length === 0 && !editingSkills && (
                  <p className="text-sm text-gray-400 italic">No skills added yet. Click edit to add skills.</p>
                )}
              </div>
            </div>

            {/* Job Preferences */}
            <div className="bg-[#f7f9fa] rounded-[20px] p-6 md:p-8 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Job Preferences</h2>
                <ActionButton isEditing={editingJobPreferences} onClick={() => handleEditToggle("jobPreferences")} />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-50">
                  <span className="text-gray-500 text-sm font-medium">Job Type</span>
                  {editingJobPreferences ? (
                    <input
                      type="text"
                      value={jobType}
                      onChange={(e) => setJobType(e.target.value)}
                      className="text-right border-b border-gray-300 outline-none font-bold text-gray-900 w-2/3 focus:border-emerald-400 text-sm"
                      placeholder="e.g. Full-time • Remote"
                    />
                  ) : (
                    <span className="font-bold text-gray-900 text-sm">{jobType || "Not specified"}</span>
                  )}
                </div>
                <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-50">
                  <span className="text-gray-500 text-sm font-medium">Location</span>
                  {editingJobPreferences ? (
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="text-right border-b border-gray-300 outline-none font-bold text-gray-900 w-2/3 focus:border-emerald-400 text-sm"
                      placeholder="e.g. Ho Chi Minh City"
                    />
                  ) : (
                    <span className="font-bold text-gray-900 text-sm">{location || "Not specified"}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
