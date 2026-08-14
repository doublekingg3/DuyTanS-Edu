const fs = require('fs');
let content = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

const oldSave = `                    onClick={() => {
                      if (!firebaseConfigStr.trim()) {
                        localStorage.removeItem('customFirebaseConfig');
                        showAlert('Đã xóa cấu hình riêng. Đang quay lại cơ sở dữ liệu mặc định...', 'success');
                        setTimeout(() => window.location.reload(), 1500);
                        return;
                      }
                      
                      try {
                        JSON.parse(firebaseConfigStr);
                        localStorage.setItem('customFirebaseConfig', firebaseConfigStr);
                        showAlert('Lưu cấu hình thành công. Hệ thống sẽ khởi động lại...', 'success');
                        setTimeout(() => window.location.reload(), 1500);
                      } catch (e) {
                        showAlert('JSON cấu hình không hợp lệ. Vui lòng kiểm tra lại.', 'error');
                      }
                    }}`;

const newSave = `                    onClick={async () => {
                      if (!firebaseConfigStr.trim()) {
                        try {
                          await deleteDoc(doc(defaultDb, 'system', 'firebaseConfig'));
                        } catch(e) {}
                        localStorage.removeItem('customFirebaseConfig');
                        showAlert('Đã xóa cấu hình riêng. Đang quay lại cơ sở dữ liệu mặc định...', 'success');
                        setTimeout(() => window.location.reload(), 1500);
                        return;
                      }
                      
                      try {
                        JSON.parse(firebaseConfigStr);
                        await setDoc(doc(defaultDb, 'system', 'firebaseConfig'), { configStr: firebaseConfigStr });
                        localStorage.setItem('customFirebaseConfig', firebaseConfigStr);
                        showAlert('Lưu cấu hình thành công cho toàn hệ thống. Đang khởi động lại...', 'success');
                        setTimeout(() => window.location.reload(), 1500);
                      } catch (e) {
                        console.error(e);
                        showAlert('Lỗi: JSON cấu hình không hợp lệ hoặc không có quyền lưu.', 'error');
                      }
                    }}`;

const oldReset = `                    onClick={() => {
                      setFirebaseConfigStr('');
                      localStorage.removeItem('customFirebaseConfig');
                      showAlert('Đã trở về cấu hình mặc định', 'info');
                      setTimeout(() => window.location.reload(), 1500);
                    }}`;

const newReset = `                    onClick={async () => {
                      try {
                        await deleteDoc(doc(defaultDb, 'system', 'firebaseConfig'));
                      } catch (e) { console.error(e) }
                      setFirebaseConfigStr('');
                      localStorage.removeItem('customFirebaseConfig');
                      showAlert('Đã trở về cấu hình mặc định cho toàn hệ thống.', 'info');
                      setTimeout(() => window.location.reload(), 1500);
                    }}`;

content = content.replace(oldSave, newSave);
content = content.replace(oldReset, newReset);

fs.writeFileSync('src/components/AdminView.tsx', content);
