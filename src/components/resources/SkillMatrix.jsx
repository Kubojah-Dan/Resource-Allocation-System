import { SKILL_NAMES } from '../../types/index';
import { cn, proficiencyLabel } from '../../lib/utils';

export function SkillMatrix({ resources }) {
  // Get all unique skills used across resources
  const allSkills = [...new Set(resources.flatMap((r) => r.skills.map((s) => s.name)))].sort();

  const getSkill = (resource, skillName) =>
    resource.skills.find((s) => s.name === skillName);

  return (
    <div className="overflow-auto">
      <table className="min-w-full border-collapse text-xs">
        <thead>
          <tr>
            <th className="sticky left-0 bg-slate-900 z-10 text-left px-3 py-2 text-muted font-medium border-b border-slate-800 w-36">Resource</th>
            {allSkills.map((skill) => (
              <th key={skill} className="px-2 py-2 text-muted font-medium border-b border-slate-800 whitespace-nowrap min-w-[80px]">
                <div className="writing-mode-vertical" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', height: 72, display: 'flex', alignItems: 'center' }}>
                  {skill}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {resources.map((r) => (
            <tr key={r.id} className="hover:bg-slate-800/30 transition-colors group">
              <td className="sticky left-0 bg-slate-900 group-hover:bg-slate-800/30 z-10 px-3 py-2 border-b border-slate-800/50">
                <div className="font-medium text-slate-300 whitespace-nowrap">{r.name.split(' ')[0]}</div>
                <div className="text-slate-600">{r.role}</div>
              </td>
              {allSkills.map((skill) => {
                const s = getSkill(r, skill);
                return (
                  <td key={skill} className="px-2 py-2 text-center border-b border-slate-800/50" title={s ? `${s.name}: ${proficiencyLabel(s.proficiency)}` : 'Not available'}>
                    {s ? (
                      <div className="flex flex-col items-center gap-0.5">
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className={cn('w-1.5 h-1.5 rounded-full', i < s.proficiency ? 'bg-indigo-400' : 'bg-slate-700')} />
                          ))}
                        </div>
                        <span className="text-[9px] text-slate-500">{s.proficiency}/5</span>
                      </div>
                    ) : (
                      <span className="text-slate-700">—</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
