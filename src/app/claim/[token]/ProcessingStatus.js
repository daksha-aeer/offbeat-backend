const ProcessingStatus = ({ address, status }) => {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto text-center">
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Wallet Address</h3>
          <p className="font-mono text-sm bg-gray-50 p-2 rounded break-all">
            {address}
          </p>
        </div>
        <div className="mt-4">
          <p className="text-gray-600">{status}</p>
        </div>
      </div>
    );
  };
  
  export default ProcessingStatus;