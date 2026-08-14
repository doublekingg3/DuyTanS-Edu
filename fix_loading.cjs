const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const oldUsers = `    const unsubscribeUsers = onSnapshot(usersRef, async (snapshot) => {
      if (snapshot.empty) {
        const batch = writeBatch(db);
        initialUsers.forEach(u => {
          const docRef = doc(usersRef, u.id);
          batch.set(docRef, u);
        });
        await batch.commit();
      } else {
        const loadedUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserAccount));
        setUsers(loadedUsers);
        usersLoaded = true;
        checkLoading();
      }
    });`;

const newUsers = `    const unsubscribeUsers = onSnapshot(usersRef, async (snapshot) => {
      if (snapshot.empty) {
        try {
          const batch = writeBatch(db);
          initialUsers.forEach(u => {
            const docRef = doc(usersRef, u.id);
            batch.set(docRef, u);
          });
          await batch.commit();
        } catch (error) {
          console.error("Error creating initial users:", error);
        }
        setUsers([]);
        usersLoaded = true;
        checkLoading();
      } else {
        const loadedUsers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserAccount));
        setUsers(loadedUsers);
        usersLoaded = true;
        checkLoading();
      }
    }, (error) => {
      console.error("Error fetching users:", error);
      usersLoaded = true;
      checkLoading();
    });`;

const oldSettings = `    const unsubscribeSettings = onSnapshot(settingsRef, async (snapshot) => {
      if (snapshot.exists()) {
        setSettings(snapshot.data() as AppSettings);
      } else {
        await setDoc(settingsRef, defaultSettings);
      }
      settingsLoaded = true;
      checkLoading();
    });`;

const newSettings = `    const unsubscribeSettings = onSnapshot(settingsRef, async (snapshot) => {
      if (snapshot.exists()) {
        setSettings(snapshot.data() as AppSettings);
      } else {
        try {
          await setDoc(settingsRef, defaultSettings);
        } catch (error) {
          console.error("Error creating default settings:", error);
        }
      }
      settingsLoaded = true;
      checkLoading();
    }, (error) => {
      console.error("Error fetching settings:", error);
      settingsLoaded = true;
      checkLoading();
    });`;

content = content.replace(oldUsers, newUsers);
content = content.replace(oldSettings, newSettings);

// Also add error handlers to other subscriptions just in case
const addErrorHandler = (str, name) => {
  return str.replace(/    \}\);/g, `    }, (error) => {\n      console.error("Error fetching ${name}:", error);\n      ${name}Loaded = true;\n      checkLoading();\n    });`);
};

// We will manually replace the others
const oldStudents = `    const unsubscribeStudents = onSnapshot(studentsRef, async (snapshot) => {
      if (snapshot.empty) {
        setStudents([]);
        studentsLoaded = true;
        checkLoading();
      } else {
        const loadedStudents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
        // Sort by STT to maintain order
        loadedStudents.sort((a, b) => a.stt - b.stt);
        setStudents(loadedStudents);
        if (loadedStudents.length > 0 && !parentStudentId) {
          setParentStudentId(loadedStudents[0].id);
        }
        studentsLoaded = true;
        checkLoading();
      }
    });`;

const newStudents = `    const unsubscribeStudents = onSnapshot(studentsRef, async (snapshot) => {
      if (snapshot.empty) {
        setStudents([]);
        studentsLoaded = true;
        checkLoading();
      } else {
        const loadedStudents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student));
        // Sort by STT to maintain order
        loadedStudents.sort((a, b) => a.stt - b.stt);
        setStudents(loadedStudents);
        if (loadedStudents.length > 0 && !parentStudentId) {
          setParentStudentId(loadedStudents[0].id);
        }
        studentsLoaded = true;
        checkLoading();
      }
    }, (error) => {
      console.error("Error fetching students:", error);
      studentsLoaded = true;
      checkLoading();
    });`;

const oldClasses = `    const unsubscribeClasses = onSnapshot(classesRef, async (snapshot) => {
      if (snapshot.empty) {
        setClasses([]);
        classesLoaded = true;
        checkLoading();
      } else {
        const loadedClasses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SchoolClass));
        setClasses(loadedClasses);
        classesLoaded = true;
        checkLoading();
      }
    });`;

const newClasses = `    const unsubscribeClasses = onSnapshot(classesRef, async (snapshot) => {
      if (snapshot.empty) {
        setClasses([]);
        classesLoaded = true;
        checkLoading();
      } else {
        const loadedClasses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SchoolClass));
        setClasses(loadedClasses);
        classesLoaded = true;
        checkLoading();
      }
    }, (error) => {
      console.error("Error fetching classes:", error);
      classesLoaded = true;
      checkLoading();
    });`;

const oldSchoolYears = `    const unsubscribeSchoolYears = onSnapshot(schoolYearsRef, async (snapshot) => {
      if (snapshot.empty) {
        setSchoolYears([]);
        schoolYearsLoaded = true;
        checkLoading();
      } else {
        const loadedYears = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SchoolYear));
        setSchoolYears(loadedYears);
        schoolYearsLoaded = true;
        checkLoading();
      }
    });`;

const newSchoolYears = `    const unsubscribeSchoolYears = onSnapshot(schoolYearsRef, async (snapshot) => {
      if (snapshot.empty) {
        setSchoolYears([]);
        schoolYearsLoaded = true;
        checkLoading();
      } else {
        const loadedYears = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SchoolYear));
        setSchoolYears(loadedYears);
        schoolYearsLoaded = true;
        checkLoading();
      }
    }, (error) => {
      console.error("Error fetching schoolYears:", error);
      schoolYearsLoaded = true;
      checkLoading();
    });`;

content = content.replace(oldStudents, newStudents);
content = content.replace(oldClasses, newClasses);
content = content.replace(oldSchoolYears, newSchoolYears);

fs.writeFileSync('src/App.tsx', content);
