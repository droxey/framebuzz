# Install FrameBuzz (Windows, MacOS, Linux)


### [Prerequisite] Install Vagrant:

Visit the Vagrant download page, and follow the installation instructions for your host OS. Vagrant supports Windows, MacOS, and Linux (Ubuntu/Debian/CentOS):
> [Vagrant - Download](https://www.vagrantup.com/downloads.html)
> [Vagrant - Documentation](https://www.vagrantup.com/docs/getting-started/)


### 1. Structure, Git Repo, and Environment Setup:

* Navigate to the directory where you store development projects, and run:
```
git clone git@github.com:torchbox/vagrant-django-base.git
```

* Rename the repo:
```
mv vagrant-django-base framebuzz
```

* Navigate to the new folder:
```
cd framebuzz
```

* Open the build.sh file, empty the contents, paste the following, and save:
```
#!/bin/bash
vagrant up
rm -f framebuzz.box
vagrant package --output framebuzz.box
```

* Open the Vagrantfile, empty the contents, paste the following, and save:
```
# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant::Config.run do |config|
	config.vm.box = "ubuntu/trusty32"
	config.vm.share_folder "v-data", "/vagrant_data", "./data"
	config.vm.provision :shell, :path => "install.sh"
end

Vagrant.configure("2") do |config|
  config.vm.provider "virtualbox" do |v|

    host = RbConfig::CONFIG['host_os']

  if host =~ /darwin/   # Give VM 1/4 system memory & access to all cpu cores on the host
    cpus = `sysctl -n hw.ncpu`.to_i
    mem = `sysctl -n hw.memsize`.to_i / 1024 / 1024 / 4  # sysctl returns Bytes and we need to convert to MB
  elsif host =~ /linux/
    cpus = `nproc`.to_i   # meminfo shows KB and we need to convert to MB
    mem = `grep 'MemTotal' /proc/meminfo | sed -e 's/MemTotal://' -e 's/ kB//'`.to_i / 1024 / 4
  else # sorry Windows folks, I can't help you
    cpus = 2
    mem = 1024
  end

  v.customize ["modifyvm", :id, "--memory", mem]
  v.customize ["modifyvm", :id, "--cpus", cpus]
  end
  
  config.vm.network "private_network", ip: "192.168.60.5"
  config.vm.network :forwarded_port, guest: 22, host: 1234, id: 'ssh', auto_correct: true
end
```

* Run the build.sh file. This will create your base Vagrant instance:
```
./build.sh
```

* Now that the base environment has been created, cd to the data directory, and clone the FrameBuzz repo. Later on, the repo will be available from within your Vagrant instance, in the folder `/vagrant_data/framebuzz/`:
```
cd data && git clone git@git.framebuzzlab.com:ross/framebuzz.git
```

* Navigate back to the root Vagrant folder, and start up the instance by running the following commands:
```
cd ../
vagrant provision
vagrant up
vagrant ssh
```

### 2. Update Your New VM:

* Once SSH'd in for the first time, ensure the VM is up to date:
```
sudo apt-get update -y -q
```

* Install pre-requisite Ubuntu packages:
```
sudo apt-get install -y gcc libc6 zlib1g-dev libexpat1-dev libssl-dev python2.7-dev libc-dev libjpeg-turbo8-dev comerr-dev libjpeg8-dev nginx libkrb5-dev libjpeg-dev libfreetype6-dev python-dev python-setuptools git-core postgresql libpq-dev memcached supervisor redis-server libxml2-dev libxslt1-dev python-software-properties
```

### 3. Database Creation:
* Once the packages complete installation, create a local database for testing. First, switch to the `postgres` user:
**Note: only the `postgres` user has permission to run `psql`.**
```
sudo su - postgres
```

* Launch the PostgreSQL manager, `psql`:
```
psql
```

* Run the following commands to create a user, create the framebuzz database, and exit the `psql` program.
**Note: Make sure to save the password. You will need it later.**
```
CREATE USER framebuzz WITH ENCRYPTED PASSWORD '[YOUR PASSWORD HERE!]';
CREATE DATABASE framebuzz WITH OWNER framebuzz ENCODING='UTF8' LC_CTYPE='en_US.UTF-8' LC_COLLATE='en_US.UTF-8' TEMPLATE template0;
\q
```

* After quitting `psql`, log the `postgres` user out.
Database creation is now complete.
```
exit
```

### 4. Project Setup:
* Once you've created a database, navigate to the FrameBuzz git repository:
```
cd /vagrant_data/framebuzz/
```

* Create the virtualenv FrameBuzz will run inside. This is required to install project pre-requisites without affecting the system-wide Python installation.
**Note: Once `mkvirtualenv` executes, the virtualenv will be sourced automatically.**
```
mkvirtualenv framebuzz
```

You should now see `(framebuzz)` in the far left position in the command prompt, as in the following example prompt:
```
(framebuzz) vagrant@fbz:/vagrant_data/framebuzz$ echo 'virtualenv activated'
```

* Install project-specific requirements, located in `requirements.txt`:
```
pip install -r requirements.txt
```

* Once all requirements finished installing, create a copy of the `local_settings.py.sample` file. `local_settings.py` is ignored by git, contains all machine-specific settings, and allows you to customize your FrameBuzz installation without affecting the rest of the development team.
```
cd framebuzz
cp local_settings.py.sample local_settings.py
```

* Edit `local_settings.py` and modify the `DATABASE` setting, **setting the PASSWORD value to match the password created in Step 3 (Database Creation)**. At this time, no other settings should be modified.
```
DATABASES = {
    'default': {
        'ENGINE': 'django_postgrespool',
        'NAME': 'framebuzz',
        'USER': 'framebuzz',
        'PASSWORD': '[YOUR PASSWORD HERE!]',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```
* Now that we can connect to our local PostgreSQL instance, cd into the root project and create the database schema:
```
cd ../
python manage.py syncdb
```
* Sync the schema changes, using South:
```
python manage.py migrate
```
* Ensure everything is running properly:
```
python manage.py validate
```
* Run the website:
**Note: Use 0.0.0.0 to listen on all interfaces.** This will allow you to test the project on your Host OS, in any browser, using the local address of the VM (ex: `192.1.10.1:3333`).
```
python manage.py runserver 0.0.0.0:3333
python manage.py celeryd --beat --loglevel=INFO
python manage.py socketserver
```


### Tips and Tricks:

* Add the following line to the bottom `~/.bashrc` to source the virtualenv and navigate to the project directory automatically upon SSH:
```
workon framebuzz && cd /vagrant_data/framebuzz/
```


* Add the IP address of your VM to your Hosts file for easy testing:

   Find the VM's IP address by running `vagrant ssh`. The server will return the following System Information output. **Note the address listed in the bottom-right, _IP address for eth1_**:
```
  System information as of Thu Jun 30 08:56:27 UTC 2016

  System load:  0.31              Processes:           98
  Usage of /:   4.7% of 39.34GB   Users logged in:     0
  Memory usage: 2%                IP address for eth0: 10.0.2.15
  Swap usage:   0%                IP address for eth1: 192.168.60.5
```

   On your Host OS, add the following line to your hosts file, using [this article](https://support.rackspace.com/how-to/modify-your-hosts-file/) to assist:
```
192.168.60.5    framebuzz.dev
```
