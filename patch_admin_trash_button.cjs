const fs = require('fs');
let c = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

const searchStr = `                              <button 
                                onClick={() => handleDeleteUser(u.id)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Xóa tài khoản"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>`;

const replaceStr = `                              <button 
                                onClick={() => handleDeleteUser(u.id)}
                                disabled={u.username === 'admin' || u.role === 'admin'}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Xóa tài khoản"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>`;

c = c.replace(searchStr, replaceStr);
fs.writeFileSync('src/components/AdminView.tsx', c);
