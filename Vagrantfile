# -*- mode: ruby -*-
# vi: set ft=ruby :

# All Vagrant configuration is done below. The "2" in Vagrant.configure
# configures the configuration version (we support older styles for
# backwards compatibility). Please don't change it unless you know what
# you're doing.
Vagrant.configure(2) do |config|
  # The most common configuration options are documented and commented below.
  # For a complete reference, please see the online documentation at
  # https://docs.vagrantup.com.

  # Every Vagrant development environment requires a box. You can search for
  # boxes at https://atlas.hashicorp.com/search.
  config.vm.box = 'ubuntu/trusty64'

  config.vm.provider 'virtualbox' do |v|
    v.memory = 1024
    v.cpus = 2
  end

  config.vm.synced_folder './out', '/root/out'

  # Enable provisioning with a shell script. Additional provisioners such as
  # Puppet, Chef, Ansible, Salt, and Docker are also available. Please see the
  # documentation for more information about their specific syntax and use.
  config.vm.provision 'shell', keep_color: true, inline: <<-SHELL
    set -ex
    apt-get update
    apt-get install -y git build-essential
    cd /root
    rm -rfv toolchain*
    curl -s https://tessel-builds.s3.amazonaws.com/firmware/toolchain-mipsel.tar.gz | tar -xz

    # Install NVM
    curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.32.0/install.sh | bash

    # Install node 4.5.0
    . /root/.nvm/nvm.sh \
      && nvm install 4.5.0 \
      && npm install -g pre-gypify node-pre-gyp node-gyp \
      && node-gyp install 4.5.0

    # Install node 6.5.0
    . /root/.nvm/nvm.sh \
      && nvm install 6.5.0 \
      && npm install -g pre-gypify node-pre-gyp node-gyp \
      && node-gyp install 6.5.0

  SHELL

  config.vm.provision(
    'file',
    source: 'compile.sh',
    destination: '/home/vagrant/compile.sh'
  )
  config.vm.provision 'shell', keep_color: true, inline: <<-SHELL
    cp /home/vagrant/compile.sh /root/
    mkdir -p /root/out
  SHELL
end
