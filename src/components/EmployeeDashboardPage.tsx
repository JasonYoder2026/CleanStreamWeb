import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import "../styles/EmployeePage.css";
import AddEmployeeModal from "./AddEmployeeModal";
import { useEmployee, useLocations } from "../di/container";
import type { EmployeeRecord } from "../interfaces/EmployeeService";

function EmployeePage() {
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [employeeList, setEmployeeList] = useState<EmployeeRecord[]>([]);
  const employeeService = useEmployee();
  const locationService = useLocations();

  useEffect(() => {
    const test = async () => {
      const ls = await locationService.getLocations();
      const locationIDs = ls.map((location) => location.id);
      const js = await employeeService.fetchEmployees(locationIDs);
      setEmployeeList(js);
    };
    test();
    console.log(employeeList);
  }, []);

  return (
    <div>
      <div className="sub-section">
        <button
          className="add-employee"
          onClick={() => setIsEmployeeModalOpen(true)}
        >
          <Plus size={15} />
          <p>Add Employee</p>
        </button>
      </div>

      <div className="employee-table-wrapper">
        <table className="employee-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Location</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
      <AddEmployeeModal
        onClose={() => setIsEmployeeModalOpen(false)}
        onSuccess={() => console.log("do stuff")}
        isOpen={isEmployeeModalOpen}
      />
    </div>
  );
}

export default EmployeePage;
