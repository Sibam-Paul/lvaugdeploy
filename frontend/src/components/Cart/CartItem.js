import React from "react";
import ListGroup from "react-bootstrap/ListGroup";

const CartItem = ({ data }) => {
  const { food, quantity } = data;
  return (
    <div className="cart-item">
      <div className="cart-items-list">
        <ListGroup>
          <ListGroup.Item> {food.name} {food.price} {quantity} <br/>

          Price: {food.price *quantity}
          </ListGroup.Item>
        </ListGroup>
      </div>
      
    </div>
  );
};

export default CartItem;
