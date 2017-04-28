# http://putaindecode.io/fr/articles/docker/dockerfile/

# FROM permet de définir notre image de base, vous pouvez l'utiliser seulement une fois dans un Dockerfile.
FROM node:4.3.1


MAINTAINER Camilo PINEDA SERNA <camilo.pinedaserna@heig-vd.ch>

#
# When we build the image, we copy the executable jar in the image file system.
# This is not a shared folder.
COPY src /opt/app/


# WORKDIR permet de changer le répertoire courant de votre image, toutes les commandes qui suivront seront exécutées à partir de ce répertoire.
WORKDIR /opt/app/

# RUN permet d'exécuter une commande à l'intérieur de votre image comme si vous étiez devant un shell unix.
RUN npm install


# EXPOSE et VOLUME permettent respectivement d'indiquer quel port et quel dossier nous souhaitons partager.
EXPOSE 2205

# [CMD] nous pouvons indiquer quelle instruction doit s'exécuter au lancement de votre conteneur grâce à l'instruction CMD


ENTRYPOINT ["node", "auditor.js"]
