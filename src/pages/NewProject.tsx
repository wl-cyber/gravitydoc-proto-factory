
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NewProjectModal from "@/components/projects/NewProjectModal";

const NewProject = () => {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const navigate = useNavigate();

  // Close the modal and navigate back to home when cancelled
  const handleClose = () => {
    setIsModalOpen(false);
    navigate("/");
  };

  return (
    <div>
      <NewProjectModal isOpen={isModalOpen} onClose={handleClose} />
    </div>
  );
};

export default NewProject;
