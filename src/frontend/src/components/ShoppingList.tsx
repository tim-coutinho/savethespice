interface ShoppingListProps {
  shoppingList: string[];
}

export default ({ shoppingList }: ShoppingListProps) => (
  <div>
    <div>{shoppingList}</div>
  </div>
);
