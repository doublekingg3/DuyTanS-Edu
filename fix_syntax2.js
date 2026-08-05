import fs from 'fs';
let code = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

const fixTarget = `
          </div>
        </div>

        
        {activeTab === 'school_years' && (
`;

const fixReplacement = `
          </div>
        </div>
        </>
        )}

        
        {activeTab === 'school_years' && (
`;

code = code.replace(fixTarget, fixReplacement);
fs.writeFileSync('src/components/AdminView.tsx', code);
