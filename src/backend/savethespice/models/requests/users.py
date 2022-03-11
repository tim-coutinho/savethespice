from savethespice.models.common import DBItem

ShoppingList = list[str]
UpdateShoppingListRequest = ShoppingList


class User(DBItem):
    userId: str
    nextCategoryId: int
    nextRecipeId: int
    shoppingList: ShoppingList
