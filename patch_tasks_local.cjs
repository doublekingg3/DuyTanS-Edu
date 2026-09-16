const fs = require('fs');
let c = fs.readFileSync('src/components/TeacherWeeklyPlan.tsx', 'utf8');

const stateCode = `  const [newTask, setNewTask] = useState('');
  const currentWeekData = weeks.find(w => w.id === selectedWeek);
  
  const [localTasks, setLocalTasks] = useState<string[]>([]);
  useEffect(() => {
    setLocalTasks(currentWeekData?.tasks || []);
  }, [currentWeekData?.tasks]);`;

c = c.replace(
  "  const [newTask, setNewTask] = useState('');\n  const currentWeekData = weeks.find(w => w.id === selectedWeek);\n  const tasks = currentWeekData?.tasks || [];",
  stateCode
);

// We need to replace usages of `tasks` with `localTasks` inside the rendering.
// Replace `tasks.map` with `localTasks.map`
c = c.replace(/\{tasks\.map/g, "{localTasks.map");
// Replace `tasks.length` with `localTasks.length`
c = c.replace(/tasks\.length/g, "localTasks.length");
// Replace `[...tasks, newTask]` with `[...localTasks, newTask]`
c = c.replace(/\[\.\.\.tasks, newTask\]/g, "[...localTasks, newTask]");

// Update the task item input
const taskInputOld = `<input 
                    type="text"
                    value={task}
                    onChange={(e) => {
                      const newTasks = [...tasks];
                      newTasks[idx] = e.target.value;
                      saveWeekToFirebase(selectedWeek, { tasks: newTasks });
                    }}
                    className="flex-1 bg-transparent outline-none font-medium text-slate-700"
                  />`;

const taskInputNew = `<input 
                    type="text"
                    value={task}
                    onChange={(e) => {
                      const newTasks = [...localTasks];
                      newTasks[idx] = e.target.value;
                      setLocalTasks(newTasks);
                    }}
                    onBlur={() => {
                      saveWeekToFirebase(selectedWeek, { tasks: localTasks });
                    }}
                    className="flex-1 bg-transparent outline-none font-medium text-slate-700"
                  />`;

c = c.replace(taskInputOld, taskInputNew);

// Update task deletion
const taskDelOld = `<button 
                    onClick={() => {
                      const newTasks = [...tasks];
                      newTasks.splice(idx, 1);
                      saveWeekToFirebase(selectedWeek, { tasks: newTasks });
                    }}
                    className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  >`;

const taskDelNew = `<button 
                    onClick={() => {
                      const newTasks = [...localTasks];
                      newTasks.splice(idx, 1);
                      saveWeekToFirebase(selectedWeek, { tasks: newTasks });
                    }}
                    className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  >`;

c = c.replace(taskDelOld, taskDelNew);

fs.writeFileSync('src/components/TeacherWeeklyPlan.tsx', c);
