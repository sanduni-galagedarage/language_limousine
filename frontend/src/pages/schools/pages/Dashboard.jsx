import { useState } from "react";
import { Upload, FileText, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Sidebar from "../components/Siebar";

export default function SchoolDashboard() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      alert("Please select a file first.");
      return;
    }

    setIsUploading(true);
    try {
      // Simulate file upload
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("File uploaded:", selectedFile.name);
      alert("File uploaded successfully!");

      // Reset form
      setSelectedFile(null);
      document.getElementById("file-input").value = "";
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error uploading file. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    document.getElementById("file-input").value = "";
  };

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-0 md:ml-64 min-h-screen w-full bg-white">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-gray-200">
          <div className="flex items-center justify-between px-4 md:px-6 py-4 max-w-7xl mx-auto">
            {/* Mobile Menu Space */}
            <div className="md:hidden w-10" />

            {/* Title */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 border border-blue-100">
                <Upload className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-gray-900">
                  Upload Student Data
                </h1>
                <p className="text-sm text-gray-500">
                  Import student information from Excel files
                </p>
              </div>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">School</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 transition-colors">
                <User className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 md:px-6 py-8 max-w-6xl">
          {/* Upload Card */}
          <Card className="bg-white shadow-lg border border-gray-200 rounded-xl">
            <CardHeader className="pb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl border-b border-gray-100">
              <CardTitle className="flex items-center gap-3 text-gray-900">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                Upload Student Data
              </CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                Select an Excel file (.xlsx, .xls) containing student
                information to upload to the system.
              </p>
            </CardHeader>

            <CardContent className="p-8">
              <div className="space-y-8">
                {/* File Upload Section */}
                <div className="space-y-4">
                  <Label
                    htmlFor="file-input"
                    className="text-base font-medium text-gray-900"
                  >
                    Choose Excel File:
                  </Label>

                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    {/* File Input */}
                    <div className="flex-1 w-full">
                      <div className="relative">
                        <input
                          id="file-input"
                          type="file"
                          accept=".xlsx,.xls"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <div className="flex items-center">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() =>
                              document.getElementById("file-input").click()
                            }
                            className="mr-4 bg-gray-50 hover:bg-gray-100 border-gray-300 text-gray-700"
                          >
                            Browse...
                          </Button>
                          <div className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-600 text-sm min-h-[40px] flex items-center">
                            {selectedFile
                              ? selectedFile.name
                              : "No file selected."}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* File Info */}
                  {selectedFile && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-800">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          Selected File:
                        </span>
                      </div>
                      <div className="mt-2 text-sm text-green-700">
                        <p>
                          <strong>Name:</strong> {selectedFile.name}
                        </p>
                        <p>
                          <strong>Size:</strong>{" "}
                          {(selectedFile.size / 1024).toFixed(2)} KB
                        </p>
                        <p>
                          <strong>Type:</strong>{" "}
                          {selectedFile.type || "Excel file"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
                  <Button
                    onClick={handleSubmit}
                    disabled={!selectedFile || isUploading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 text-base"
                    size="lg"
                  >
                    {isUploading ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Submit
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="flex-1 bg-gray-50 hover:bg-gray-100 border-gray-300 text-gray-700 font-medium py-3 text-base"
                    size="lg"
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instructions Card */}
          <Card className="mt-8 bg-blue-50 border border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg text-blue-900">
                Upload Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="text-blue-800">
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                  Ensure your Excel file contains the required columns: Student
                  ID, Name, Email, Grade, etc.
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                  The first row should contain column headers.
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                  Supported file formats: .xlsx and .xls
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
                  Maximum file size: 10MB
                </li>
              </ul>
            </CardContent>
          </Card>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white mt-auto">
          <div className="container mx-auto px-4 md:px-6 py-4">
            <p className="text-center text-sm text-gray-500">
              Copyright © 2024. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
