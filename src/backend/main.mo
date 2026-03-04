import Time "mo:core/Time";
import List "mo:core/List";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";

actor {
  type MenuItem = {
    name : Text;
    price : Nat;
  };

  type OrderItem = {
    itemName : Text;
    quantity : Nat;
  };

  type Order = {
    orderId : Nat;
    customerName : Text;
    deliveryPlace : Text;
    mobileNumber : Text;
    items : [OrderItem];
    totalAmount : Nat;
    timestamp : Int;
  };

  var nextOrderId = 1;

  let orders = Map.empty<Nat, Order>();

  let menuItems : [MenuItem] = [
    { name = "Soya Kebab"; price = 40 },
    { name = "Soya 65"; price = 50 },
    { name = "Soya Manchurian"; price = 60 },
    { name = "Lasagna"; price = 80 },
    { name = "Caramel Pudding"; price = 50 },
  ];

  public shared ({ caller }) func submitOrder(
    customerName : Text,
    deliveryPlace : Text,
    mobileNumber : Text,
    items : [OrderItem],
    totalAmount : Nat,
  ) : async Nat {
    if (items.size() == 0) {
      Runtime.trap("Order must contain at least one item.");
    };

    let orderId = nextOrderId;
    nextOrderId += 1;

    let order : Order = {
      orderId;
      customerName;
      deliveryPlace;
      mobileNumber;
      items;
      totalAmount;
      timestamp = Time.now();
    };

    orders.add(orderId, order);
    orderId;
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    orders.values().toArray();
  };

  public query ({ caller }) func getMenu() : async [MenuItem] {
    menuItems;
  };
};
