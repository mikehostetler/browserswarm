Vagrant::Config.run do |config|
  config.vm.box = "precise32"
  
  config.vm.box_url = "http://files.vagrantup.com/precise32.box"

  config.vm.forward_port 3000, 3000

  config.vm.provision :chef_solo do |chef|
    chef.add_recipe "nodejs"
    chef.add_recipe "mongodb-debs"
    # chef.add_recipe "redis-server"
    chef.json = {
      "nodejs" => {
        "version" => "0.10.22"
      }
    }
  end

$script = <<SCRIPT
sudo apt-get install -y build-essential --no-install-recommends
sudo apt-get install -y ruby1.9.1-dev --no-install-recommends
sudo apt-get install -y ruby1.9.3 --no-install-recommends
sudo gem install cf

sudo apt-get install git phantomjs

npm install -g forever nodemon

cd /vagrant
npm install 

cd /vagrant/node_modules/strider/

SCRIPT

	config.vm.provision "shell", inline: $script

end
