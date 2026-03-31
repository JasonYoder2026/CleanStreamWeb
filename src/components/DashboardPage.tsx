import TodayRevenue from "../components/TodayRevenue";
import MonthlyIncome from "../components/MonthlyIncome";

function DashBoard() {
    return (
        <div>
            <h1>Dashboard</h1>
            <TodayRevenue/>
            <MonthlyIncome/>
        </div>
    )
}

export default DashBoard;