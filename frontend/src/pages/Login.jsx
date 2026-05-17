function Login() {
  const loginGoogle = () => {
    window.location.href = "http://localhost:5236/api/auth/login";
  };

  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="max-w-md bg-surface-container-lowest rounded-xl shadow border border-outline-variant/30 overflow-hidden flex flex-col">
        <div className="relative h-48 bg-surface-container w-full flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <img
              alt="Beautiful serene mosque interior with intricate Islamic architecture"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUK50KTJ2hOmuiEacp8LVdISdlSX4ofDO200fpD5TteuACUrexv1EzCUbzGmHjNvDHJe8ZFlZMY7JLpA2bBIovDQ3kVmMV7C8kTWQXXCWgagKR-SWcHb7gn0jSswryFAWP2iKJir4Rdz6sqFMOfCgJ1NQIJN6mO20wz1OF4B9OZOI7biMmPxe3GZws8M7iEKEDeyWiwqkCkbMOSRmKy6F122zjK96ezBAdwC_--JG16GUvxqTkka377faRSzgfy-Cn2AhDcos9Zyc"
            />
            <div className="absolute inset-0 bg-primary-container/10 mix-blend-multiply"></div>
            <div className="absolute inset-0 bg-linear-to-b from-primary-container/40 to-background"></div>
          </div>
          <div className="relative z-10 flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-surface-container-lowest rounded-full flex items-center justify-center shadow-sm border border-primary-container/10">
              <span className="material-symbols-outlined text-primary-container text-4xl! icon-fill" data-icon="menu_book">
                menu_book
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary-container text-center px-4">
              Gabung Sangu Umat
            </h1>
          </div>
        </div>
        <div className="p-8 flex flex-col gap-6 bg-surface-container-lowest">
          <div className="text-center">
            <p className="font-body-md text-body-md text-on-surface-variant">
              Bridge traditional wisdom with modern clarity. Sign in to continue your journey.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <button
              className="cursor-pointer w-full flex items-center justify-center gap-3 bg-surface border border-outline-variant rounded-lg py-3 px-4 font-label-sm text-label-sm text-on-surface hover:bg-surface-container-low transition-colors duration-200"
              onClick={loginGoogle}
            >
              <svg className="w-5 h-5 fill-current" viewBox="-3 0 262 262" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid">
                <path
                  d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
                  fill="#4285F4"
                />
                <path
                  d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
                  fill="#34A853"
                />
                <path
                  d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
                  fill="#FBBC05"
                />
                <path
                  d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
                  fill="#EB4335"
                />
              </svg>
              Login with Google
            </button>
            <button className="hidden! w-full flex items-center justify-center gap-3 bg-[#25D366]/10 border border-[#25D366]/30 rounded-lg py-3 px-4 font-label-sm text-label-sm text-[#075E54] hover:bg-[#25D366]/20 transition-colors duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 510 512.459" className="w-5 h-5 fill-current">
                <path
                  fill="currentColor"
                  d="M435.689 74.468C387.754 26.471 324 .025 256.071 0 116.098 0 2.18 113.906 2.131 253.916c-.024 44.758 11.677 88.445 33.898 126.946L0 512.459l134.617-35.311c37.087 20.238 78.85 30.891 121.345 30.903h.109c139.949 0 253.88-113.917 253.928-253.928.024-67.855-26.361-131.645-74.31-179.643v-.012zm-179.618 390.7h-.085c-37.868-.011-75.016-10.192-107.428-29.417l-7.707-4.577-79.886 20.953 21.32-77.889-5.017-7.987c-21.125-33.605-32.29-72.447-32.266-112.322.049-116.366 94.729-211.046 211.155-211.046 56.373.025 109.364 22.003 149.214 61.903 39.853 39.888 61.781 92.927 61.757 149.313-.05 116.377-94.728 211.058-211.057 211.058v.011zm115.768-158.067c-6.344-3.178-37.537-18.52-43.358-20.639-5.82-2.119-10.044-3.177-14.27 3.178-4.225 6.357-16.388 20.651-20.09 24.875-3.702 4.238-7.403 4.762-13.747 1.583-6.343-3.178-26.787-9.874-51.029-31.487-18.86-16.827-31.597-37.598-35.297-43.955-3.702-6.355-.39-9.789 2.775-12.943 2.849-2.848 6.344-7.414 9.522-11.116s4.225-6.355 6.343-10.581c2.12-4.238 1.06-7.937-.522-11.117-1.584-3.177-14.271-34.409-19.568-47.108-5.151-12.37-10.385-10.69-14.269-10.897-3.703-.183-7.927-.219-12.164-.219s-11.105 1.582-16.925 7.939c-5.82 6.354-22.209 21.709-22.209 52.927 0 31.22 22.733 61.405 25.911 65.642 3.177 4.237 44.745 68.318 108.389 95.812 15.135 6.538 26.957 10.446 36.175 13.368 15.196 4.834 29.027 4.153 39.96 2.52 12.19-1.825 37.54-15.353 42.824-30.172 5.283-14.818 5.283-27.529 3.701-30.172-1.582-2.641-5.819-4.237-12.163-7.414l.011-.024z"
                />
              </svg>
              Login with WhatsApp
            </button>
          </div>
          <div className="hidden items-center gap-4 py-2">
            <div className="flex-1 h-px bg-outline-variant/50"></div>
            <span className="font-label-sm text-label-sm text-outline">or</span>
            <div className="flex-1 h-px bg-outline-variant/50"></div>
          </div>
          <div className="hidden text-center">
            <a
              className="font-label-sm text-label-sm text-primary-container hover:text-primary transition-colors inline-flex items-center gap-1"
              href="#"
            >
              Continue with Email
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </a>
          </div>
        </div>
        <div className="hidden bg-surface p-4 text-center border-t border-outline-variant/20">
          <p className="font-label-sm text-label-sm text-on-surface-variant">
            By joining, you agree to our{" "}
            <a className="text-primary-container hover:underline" href="#">
              Terms
            </a>{" "}
            &amp;
            <a className="text-primary-container hover:underline" href="#">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}

export default Login;
