from flask_restx import Api

from apis.auth import api as auth
from apis.categories import api as categories
from apis.recipes import api as recipes
from apis.scrape import api as scrape
from apis.shopping_list import api as shopping_list

api = Api(title="SaveTheSpice", version="0.1.0", description="Recipe saver.")
api.add_namespace(auth)
api.add_namespace(categories)
api.add_namespace(recipes)
api.add_namespace(scrape)
api.add_namespace(shopping_list)
