# t2-compiler

Precompilation for Tessel 2 modules. Uses a VM to run build tools for now.

```
t2-compiler build [--target=vm|tessel] [--recursive=false]
t2-compiler populate [--target=vm|tessel] [--recursive=true] [--build-needed=true]
t2-compiler depopulate
t2-compiler cache list
t2-compiler cache clear [<name>[@<version>]]
```

## license

mit/asl2
