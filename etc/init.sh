#/bin/bash

# base project directory
PROJECT_DIR=/home/chleba/chlebaPrivate/kanban
# apache symlink name
BIN=kanban

# apache config file
APACHE_CONF_FILE=${PROJECT_DIR}/conf/httpd.conf


NAME=`/usr/bin/basename ${BIN}`
if [ -h ${BIN} ]
then
    PIDOF_CMD="/bin/pidof ${NAME}"
else
    PIDOF_CMD="/bin/pidof ${BIN}"
fi


case "$1" in

    start)
        echo "Starting Apache Python kanban"
        echo -n "$PROJET_DIR/bin/$BIN -f $APACHE_CONF_FILE"
        $PROJECT_DIR/bin/$BIN -f $APACHE_CONF_FILE
        echo " OK."
        ;;

    stop)
        echo -n "Killing Apache "
        /bin/kill -TERM `${PIDOF_CMD}`
        echo "OK."
        ;;

    restart)
        ${0} stop
        sleep 0.5
        ${0} start
        ;;

    *)
        ${0} restart
        ;;

esac

exit 0
