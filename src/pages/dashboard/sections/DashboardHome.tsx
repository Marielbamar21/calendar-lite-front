import { useRooms } from "../../../features/rooms/hooks/useRooms";
import { DotLoader } from "react-spinners";

export default function DashboardHome() {
  const { total: roomsTotal, isLoading: roomsLoading } = useRooms({
    initialPage: 1,
    limit: 1,
  });

  if (roomsLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <DotLoader color="rgb(100, 108, 255)" size={40} />
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-10rem)] justify-center items-center">
      <div className="flex flex-col items-center space-y-8">
        <h2 className="text-5xl font-semibold text-calendar-right text-center">
          Welcome again
        </h2>
        <p className="text-xl text-gray-700 dark:text-gray-300">
          Rooms: {roomsTotal}
        </p>
      </div>
    </div>
  );
}
