import { Link } from "react-router-dom";

const CategoryCard = ({ title, description, icon: Icon, delay = "0s" }) => {
  return (
    <Link to="/generator">
      <div 
        className="glass rounded-2xl p-6 hover:scale-105 transition-all cursor-pointer group hover:glow-primary"
        style={{ animationDelay: delay }}
      >
        <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <Icon className="h-7 w-7 text-white" />
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
    </Link>
  );
};

export default CategoryCard;