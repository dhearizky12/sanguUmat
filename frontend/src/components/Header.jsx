import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function Header() {
  const { isAuthenticated, logout } = useAuth();

  const classNav = ({ isActive }) => `${isActive && "font-bold border-b-2 border-primary-container"} `;

  const isAdmin = false;

  const menus = [
    {
      label: "Beranda",
      to: "/",
      matchPaths: ["/"],
    },
    {
      label: "Tanya Jawab",
      to: "/questions",
      matchPaths: ["/questions", "/create-question", "/details-question"],
    },
    {
      label: "Artikel",
      to: "/articles",
      matchPaths: ["/articles", "/create-article", "/details-article"],
    },
    {
      label: "Ngaji Bareng",
      to: "/live",
      matchPaths: ["/live"],
    },
  ];

  return (
    <nav className="bg-surface shadow-sm top-0 z-50 sticky">
      <div className="max-w-container-max mx-auto px-gutter grid grid-cols-2 md:grid-cols-4 w-full h-20">
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="rounded-lg flex items-center justify-center">
            <span className="material-symbols-outlined text-primary icon-fill text-4xl!" data-icon="menu_book">
              menu_book
            </span>
          </div>
          <span className="text-title-md font-bold text-primary-container">Sangu Umat</span>
        </div>
        <div className="col-span-2 hidden md:flex justify-center space-x-8 h-full">
          {menus.map((menu) => {
            const isActive = menu.matchPaths.some((path) => location.pathname === path);

            return (
              <NavLink
                key={menu.to}
                to={menu.to}
                className={`flex items-center h-full text-primary-container text-body-md hover:text-primary-container transition-transform duration-200 active:scale-95 ${isActive && "font-bold border-b-2 border-primary-container"}`}
              >
                {menu.label}
              </NavLink>
            );
          })}
          {isAdmin && (
            <NavLink to="/admin" className={classNav}>
              Scholars
            </NavLink>
          )}
        </div>
        <div className="flex items-center gap-4 justify-end">
          <Link
            to="/create-question"
            className="bg-primary-container text-on-primary font-label-sm text-label-sm px-6 py-2.5 rounded-full hover:bg-tertiary transition-colors shadow-sm cursor-pointer text-nowrap"
          >
            <span>Buat Pertanyaan</span>
          </Link>
          {isAuthenticated ? (
            <button onClick={logout} className="cursor-pointer">
              <img
                alt="User Avatar"
                className="w-10 h-10 rounded-full border border-outline-variant object-cover"
                data-alt="profile picture"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAlecWxw8KhGJrYkMsZa7yLQi5icyYgE-fAWvyuZ5jbdjOfs794jd2bQSL34Gf5OFntHesK4uWxMWiKbtefoxc98or2hGz94jdY3ujxbXyhpdUt45EDRaU-_rLwLNvwGrooq4vAV3kXbfN6ev1SSvow4AgiyZbaKmxMqeuqlYAvXeRC2zwwZNBe3hObPSt1027GolP1Yh9cbOWKOQKxgGBMVE6T-xtMU6ABqPwFnjQq0Hm56h_MlaI6AKTxJOu42275b4dWXGFYEQk"
              />
            </button>
          ) : (
            <Link
              to="/login"
              className="hidden md:flex text-primary font-label-sm text-label-sm px-6 py-2.5 rounded-full transition-colors border border-primary cursor-pointer items-center"
            >
              <span className="material-symbols-outlined -my-3 mr-2" data-icon="login">
                login
              </span>
              <div>Login</div>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Header;
