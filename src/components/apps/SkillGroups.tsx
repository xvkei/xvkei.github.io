import { skills } from '../../data/config';
import { SetupNote } from '../ui/SetupNote';
import { TagList } from '../ui/TagList';

export function SkillGroups() {
  if (skills.length === 0) {
    return (
      <SetupNote>
        No skills listed yet. Add groups to <code>skills</code> in <code>src/data/config.ts</code>.
      </SetupNote>
    );
  }
  return (
    <dl className="skills">
      {skills.map((g) => (
        <div key={g.group}>
          <dt>{g.group}</dt>
          <dd><TagList items={g.items} label={g.group} /></dd>
        </div>
      ))}
    </dl>
  );
}