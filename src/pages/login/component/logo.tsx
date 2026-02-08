interface LogoProps {
  className?: string;
  imgClassName?: string;
  titleClassName?: string;
}

const Logo = ({ className, imgClassName, titleClassName }: LogoProps) => {
  return (
    <div
      className={`flex flex-col justify-center items-center w-full md:mb-6 mb-3 ${className ?? ""}`}
    >
      <img
        src="/logo.svg"
        alt="Logo"
        className={`md:w-70 md:h-70 w-50 h-50 object-contain mx-auto ${imgClassName ?? ""}`}
      />
      <h3
        className={`text-4xl font-medium text-calendar-ring ${titleClassName ?? ""}`}
      >
        Calendar-lite
      </h3>
    </div>
  );
};

export default Logo;
