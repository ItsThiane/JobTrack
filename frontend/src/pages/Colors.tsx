const colors = [
  'red','orange','amber','yellow','lime','green','emerald','teal','cyan','sky','blue','indigo','violet','purple','fuchsia','pink','rose','gray'
];

const shades = [50,100,200,300,400,500,600,700,800,900];

export default function Colors() {
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Tailwind Colors Demo</h1>

      {/* Hidden block with all classes so Tailwind will generate them */}
      <div className="hidden">
        {colors.map((c) => (
          <span key={c}>
            {shades.map((s) => ` bg-${c}-${s}`)}
          </span>
        ))}
      </div>

      {colors.map((color) => (
        <section key={color}>
          <h2 className="mb-3 font-semibold">{color}</h2>
          <div className="flex flex-wrap gap-3">
            {shades.map((shade) => {
              const className = `bg-${color}-${shade}`;
              const textClass = shade >= 500 ? 'text-white' : 'text-black';
              return (
                <div
                  key={shade}
                  className={`w-44 h-16 rounded-md flex items-center justify-between px-4 ${className} ${textClass} border border-black/5`}
                >
                  <div className="font-medium">{`${color}-${shade}`}</div>
                  <div className="text-sm opacity-80">#{/* visual only */}</div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
