
import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <div className="bg-dark text-white p-3" style={{ minHeight: "100vh" }}>
      <h5 className="mb-4">Dashboard</h5>

      <ul className="nav flex-column gap-2">
        <li className="nav-item">
          <NavLink to="/dashboard" className="nav-link text-white">
            Overview
          </NavLink>
        </li>

        <li className="nav-item">
          <NavLink to="/dashboard/courses" className="nav-link text-white">
            My Courses
          </NavLink>
        </li>

        <li className="nav-item">
          <NavLink to="/dashboard/progress" className="nav-link text-white">
            My Progress
          </NavLink>
        </li>

        <li className="nav-item">
          <NavLink to="/dashboard/profile" className="nav-link text-white">
            Profile
          </NavLink>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
