const fs = require('fs');
let c = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

c = c.replace(/export default function AdminView\(\{ classes, students, users, schoolYears, settings \}: \{ classes: SchoolClass\[\], students: Student\[\], users: UserAccount\[\], schoolYears: SchoolYear\[\], settings\?: AppSettings \}\) \{/, 
  "export default function AdminView({ classes, students, users, schoolYears, settings, externalActiveTab }: { classes: SchoolClass[], students: Student[], users: UserAccount[], schoolYears: SchoolYear[], settings?: AppSettings, externalActiveTab?: string }) {");

c = c.replace(/const \[activeTab, setActiveTab\] = useState<'classes' \| 'accounts' \| 'school_years' \| 'backup' \| 'firebase' \| 'ai_config' \| 'reports'\>\('classes'\);/,
  "const [activeTabState, setActiveTab] = useState<'classes' | 'accounts' | 'school_years' | 'backup' | 'firebase' | 'ai_config' | 'reports'>('classes');\n  const activeTab = externalActiveTab || activeTabState;");

const tabNavStart = `{/* Tab Navigation */}`;
const tabNavSearch = `        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2.5 mb-8">`;
c = c.replace(tabNavSearch, `        {/* Tab Navigation */}
        {!externalActiveTab && <div className="flex flex-wrap gap-2.5 mb-8">`);

const tabNavEnd = `<Cloud className="w-4 h-4" /> Kết nối Firebase
          </button>
        </div>`;
c = c.replace(tabNavEnd, `<Cloud className="w-4 h-4" /> Kết nối Firebase
          </button>
        </div>}`);

fs.writeFileSync('src/components/AdminView.tsx', c);
