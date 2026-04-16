import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const ProfileTopBar = ({}) => {
  const location = useLocation();

  const validRoles = ['candidate', 'recruiters'];

  const firstSegment = location.pathname.split('/')[1];


  const currentRole = validRoles.includes(firstSegment) ? firstSegment : 'candidate';

  const navLinkStyle = (path) => {
    const isActive = location.pathname.includes(path);
    return isActive
      ? "text-[#188155] font-semibold border-b-2 border-[#188155] pb-1"
      : "text-gray-500 font-medium hover:text-[#188155] pb-1 transition-colors";
  };

  return (
    <header className="bg-[#fbfcfa] border-b border-gray-100 sticky top-0 z-50">
      <div className="w-full mx-auto px-10 h-16 flex items-center justify-between">        
        <div className="flex items-center gap-10 text-xl font-bold text-[#116843]">
            Job Tracker
          
          <nav className="hidden md:flex items-center gap-6 mt-1 text-sm tracking-wide">
            <Link to={`/${currentRole}/job`} className={navLinkStyle(`/${currentRole}/job`)}>Find Jobs</Link>
            <Link to={`/${currentRole}/applications`} className={navLinkStyle(`/${currentRole}/applications`)}>Applications</Link>
            <Link to={`/${currentRole}/messages`} className={navLinkStyle(`/${currentRole}/messages`)}>Messages</Link>
          </nav>
        </div>

        {/* Thông tin User */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-800">{ "Tên Người Dùng"}</p>
            <p className="text-xs text-gray-500">{"email@example.com"}</p>
          </div>
        </div>

      </div>
    </header>
  );
};

export default ProfileTopBar;