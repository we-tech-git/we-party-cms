export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white font-sans">
      {/* Coluna do formulário */}
      <div className="flex w-full items-center justify-center overflow-y-auto px-8 py-8 md:w-1/2">
        <div className="w-full max-w-[400px]">{children}</div>
      </div>

      {/* Coluna da marca — oculta em mobile */}
      <div
        className="relative hidden w-1/2 items-center justify-center overflow-hidden md:flex"
        style={{
          background:
            'linear-gradient(142.35deg, rgba(252,149,89,0.15) -1.66%, rgba(255,98,216,0.15) 100.44%)',
        }}
      >
        {/* Elementos decorativos */}
        <BrandDecorations />

        <div className="relative z-10 text-center">
          <h2
            className="brand-title select-none text-[100px] font-extrabold leading-tight"
            style={{
              fontFamily: "'Baloo Thambi 2', cursive",
              background: 'linear-gradient(to right, #FFC947, #F978A3)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            WE PARTY
          </h2>
          <p
            className="mt-4 text-[65px] font-bold leading-[80px] tracking-wide text-[#595959]"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            A sua próxima
            <br />
            <span className="text-[#ff6262be]">festa.</span>
          </p>
        </div>
      </div>
    </div>
  )
}

function BrandDecorations() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      <span className="absolute left-[10%] top-[45%] text-[80px] text-[rgba(255,201,71,0.6)] rotate-[15deg]">★</span>
      <span className="absolute right-[30%] top-[10%] text-[45px] text-[rgba(249,120,163,0.6)] -rotate-[10deg]">★</span>
      <span className="absolute bottom-[15%] left-[45%] text-[30px] text-[rgba(255,201,71,0.5)]">★</span>
      <span className="absolute right-[12%] top-[12%] text-[1.8rem] font-light text-[rgba(255,98,159,0.5)] rotate-45">+</span>
      <span className="absolute bottom-[12%] left-[10%] text-[1.5rem] font-light text-[rgba(255,98,159,0.5)] rotate-45">+</span>
      <span className="absolute left-[10%] top-[30%] text-[2.2rem] font-light text-[rgba(255,98,159,0.4)]">+</span>
      <span
        className="absolute left-[25%] top-[25%] h-[35px] w-[15px] rotate-45"
        style={{ backgroundColor: 'rgba(249,120,163,0.7)' }}
      />
      <span
        className="absolute bottom-[10%] right-[8%] h-[30px] w-[12px] -rotate-[35deg]"
        style={{ backgroundColor: 'rgba(255,201,71,0.8)' }}
      />
      <span
        className="absolute right-[35%] top-[70%] h-[45px] w-[20px] rotate-[25deg]"
        style={{ backgroundColor: 'rgba(249,120,163,0.5)' }}
      />
      <span
        className="absolute bottom-[15%] left-[80%] h-[15px] w-[15px] rounded-full"
        style={{ backgroundColor: 'rgba(255,98,159,0.5)' }}
      />
      <span
        className="absolute right-[35%] top-[20%] h-[20px] w-[20px] rounded-full"
        style={{ backgroundColor: 'rgba(255,98,159,0.5)' }}
      />
    </div>
  )
}
