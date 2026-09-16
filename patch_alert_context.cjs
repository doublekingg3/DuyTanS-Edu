const fs = require('fs');
let c = fs.readFileSync('src/contexts/AlertContext.tsx', 'utf8');

c = c.replace(
  "const [resolveConfirm, setResolveConfirm] = useState<((value: boolean) => void) | null>(null);",
  "const resolveConfirmRef = React.useRef<((value: boolean) => void) | null>(null);"
);

c = c.replace(
  "    return new Promise<boolean>((resolve) => {\n      setResolveConfirm(() => resolve);\n    });",
  "    return new Promise<boolean>((resolve) => {\n      resolveConfirmRef.current = resolve;\n    });"
);

c = c.replace(
  "  const handleConfirm = useCallback(() => {\n    if (resolveConfirm) resolveConfirm(true);\n    setConfirmState(prev => ({ ...prev, isOpen: false }));\n    setResolveConfirm(null);\n  }, [resolveConfirm]);",
  "  const handleConfirm = useCallback(() => {\n    if (resolveConfirmRef.current) resolveConfirmRef.current(true);\n    setConfirmState(prev => ({ ...prev, isOpen: false }));\n    resolveConfirmRef.current = null;\n  }, []);"
);

c = c.replace(
  "  const handleCancel = useCallback(() => {\n    if (resolveConfirm) resolveConfirm(false);\n    setConfirmState(prev => ({ ...prev, isOpen: false }));\n    setResolveConfirm(null);\n  }, [resolveConfirm]);",
  "  const handleCancel = useCallback(() => {\n    if (resolveConfirmRef.current) resolveConfirmRef.current(false);\n    setConfirmState(prev => ({ ...prev, isOpen: false }));\n    resolveConfirmRef.current = null;\n  }, []);"
);

fs.writeFileSync('src/contexts/AlertContext.tsx', c);
