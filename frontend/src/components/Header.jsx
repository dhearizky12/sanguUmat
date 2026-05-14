import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function Header() {
  const { isAuthenticated, logout } = useAuth();

  const classNav = ({ isActive }) =>
    `${isActive && "font-bold border-b-2 border-primary-container"} flex items-center h-full text-primary-container text-body-md hover:text-primary-container transition-transform duration-200 active:scale-95`;

  const isAdmin = false;

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
          <NavLink to="/" className={classNav}>
            Beranda
          </NavLink>
          <NavLink to="/questions" className={classNav}>
            Tanya Jawab
          </NavLink>
          <NavLink to="/articles" className={classNav}>
            Artikel
          </NavLink>
          <NavLink to="/live" className={classNav}>
            Ngaji Bareng
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin" className={classNav}>
              Scholars
            </NavLink>
          )}
        </div>
        <div className="flex items-center gap-4 justify-end">
          <button className="hidden! text-on-surface-variant hover:text-primary-container transition-colors p-2 rounded-full hover:bg-surface-container-low hidden md:flex cursor-pointer">
            <span className="material-symbols-outlined" data-icon="notifications">
              notifications
            </span>
          </button>
          <button className="hidden! text-on-surface-variant hover:text-primary-container transition-colors p-2 rounded-full hover:bg-surface-container-low hidden md:flex cursor-pointer">
            <span className="material-symbols-outlined" data-icon="bookmark">
              bookmark
            </span>
          </button>
          <button className="md:flex bg-primary-container text-on-primary font-label-sm text-label-sm px-6 py-2.5 rounded-full hover:bg-tertiary transition-colors shadow-sm cursor-pointer">
            <span className="hidden md:block">Buat Pertanyaan</span>
            <span className="md:hidden">Tanya</span>
          </button>
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
              className="hidden md:flex bg-primary-container text-on-primary font-label-sm text-label-sm px-6 py-2.5 rounded-full hover:bg-tertiary transition-colors shadow-sm cursor-pointer items-center"
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
