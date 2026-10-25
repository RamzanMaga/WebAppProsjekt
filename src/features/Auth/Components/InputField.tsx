//Det denne koden gjør er å lage et inputfelt som kan brukes i en form. 
//Den tar inn flere props som label, name, type, placeholder, autoComplete og minLength.
//Labelen vises over inputfeltet, og inputfeltet har forskjellige stylinger for å gjøre det mer brukervennlig.
// Inputfeltet er også påkrevd, noe som betyr at brukeren må fylle det ut før de kan sende inn skjemaet.
type Props = {
  label: string; 
  name: string; 
  type?: string; 
  placeholder?: string; 
  autoComplete?: string; 
  minLength?: number; 
};

export function InputField({ 
  label, 
  name, 
  type = "text", 
  placeholder, 
  autoComplete, 
  minLength }:
   Props) {
  return (
  <label className="block text-sm font-medium text-slate-700">
    {label}

    <input 
    name={name} 
    type={type} 
    placeholder={placeholder} 
    autoComplete={autoComplete} 
    minLength={minLength} 
    required
      className="mt-1.5 block w-full rounded-lg border border-slate-300 
      bg-white px-3 py-2.5 text-base text-slate-900 outline-none 
      focus:border-blue-600 focus:ring-2 focus:ring-blue-100" />
  </label>
  );
}
