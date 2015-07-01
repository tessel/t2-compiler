# t2-compiler

Precompilation for Tessel 2 modules. Uses a VM to run build tools for now.

```
t2-compiler build [--target=vm|tessel] [--recursive=false]
t2-compiler populate [--target=vm|tessel] [--recursive=true] [--build-needed=true]
t2-compiler depopulate
t2-compiler cache list
t2-compiler cache clear [<name>[@<version>]]
```

## how to use it

Install the in-development Tessel 2 tools:

```
npm install -g git+https://github.com/tessel/t2-cli
npm install -g git+https://github.com/tessel/t2-vm
npm install -g git+https://github.com/tessel/t2-compiler
```

Install the SSHPass command line dependency:

```
# For OSX
brew install https://raw.githubusercontent.com/kadwanev/bigboybrew/master/Library/Formula/sshpass.rb
```

Initialize and run the Tessel 2 VM:

```
t2-vm create
t2-vm launch
```

Note the hostname that is logged to the console.

Next (in another terminal window) clone this simple Hello World example:

```
git clone https://gist.github.com/tcr/b99edad665936b46f20a hello-world
cd hello-world
```

This is a binary Node module, meaning that it has code written in C++ with bindings to a JavaScript API. This module defines a function, `hello.world()`, that returns the C string "hello world!" as follows:

```cc
#include <nan.h>
 
using namespace v8;
 
NAN_METHOD(Method) {
  NanScope();
  NanReturnValue(NanNew("Hello world!"));
}
 
void Init(Handle<Object> exports) {
  exports->Set(NanNew("hello"), NanNew<FunctionTemplate>(Method)->GetFunction());
}
 
NODE_MODULE(hello, Init)
```

Run this on your host computer:

```
npm install
node index.js
...
Hello world!
```

Now let's run this on a Tessel 2 VM. Run:

```
t2-compiler populate --target=vm
t2 run index.js --name <Tessel- hostname from t2 vm run>
...
Hello world!
```

Now, even if you don't own a Tessel 2, the process will be radically similar: compile your binary modules to target the device you want, then deploy them. (In the future, we'll a build server to run this population step as part of `t2 run`)

So on hand, we have some beta Tessel 2's. If we were to kill your t2-vm process, then plug in a Tessel 2, we could run:

```
t2-compiler populate --target=t2
t2 run index.js --usb
...
Hello world!
```

Great job!

## license

mit/asl2
