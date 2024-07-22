import TabBar from "@/components/tab-bar";
import React from "react";

const TabLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      {children}
      <TabBar />
    </div>
  );
};

export default TabLayout;
