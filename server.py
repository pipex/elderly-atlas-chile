import bottle
from bottle import Bottle, static_file

app = Bottle()

@app.route('')
@app.route('/')
def index():
	return static_file('index.html', root='web')

@app.route('/:path#.+#', name='/')
def send_static(path):
    """Configure static routes"""
    return static_file(path, root='web')


###########################################
# Web errors
###########################################

@app.error(404)
def Error404(code):
    return static_file('404.html', root='web')


############################################
# Application execution
############################################

# The application execution goes at the end so all routes are loaded
def main():
    bottle.run(app=app)

if __name__ == '__main__':
    main()