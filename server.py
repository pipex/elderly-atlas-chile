from bottle import error, route, static_file, run, redirect


@route('')
@route('/')
def index():
	return static_file('index.html', root='web')

@route('/:path#.+#', name='/')
def send_static(path):
    """Configure static routes"""
    return static_file(path, root='web')


###########################################
# Web errors
###########################################

@error(404)
def Error404(code):
    return static_file('404.html', root='web')


############################################
# Application execution
############################################

# The application execution goes at the end so all routes are loaded
def main():
#    # TODO: Remove on production
    # bottle.debug(True)
#
    # bottle.default_app().catchall = False
    run(host='localhost', port=8080)

if __name__ == '__main__':
    main()